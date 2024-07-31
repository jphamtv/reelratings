from datetime import datetime, timedelta
import json
import logging
import redis
import redis.exceptions
import time
from environs import Env

logger = logging.getLogger(__name__)

env = Env()
env.read_env()

QUICK_RETRY_DELAY = 0.1  # 100 milliseconds
LONG_RETRY_DELAY = 2  # 2 seconds

# Cache duration
SHORT_TERM_CACHE = timedelta(hours=23)
MEDIUM_TERM_CACHE = timedelta(days=30)
LONG_TERM_CACHE = timedelta(days=365)

# Convert cache duration to seconds for Redis
SHORT_TERM_CACHE_SECONDS = int(SHORT_TERM_CACHE.total_seconds())
MEDIUM_TERM_CACHE_SECONDS = int(MEDIUM_TERM_CACHE.total_seconds())
LONG_TERM_CACHE_SECONDS = int(LONG_TERM_CACHE.total_seconds())

redis_client = redis.from_url(env.str("REDIS_URL"), decode_responses=True)


def ensure_connection():
    """Ping Redis to ensure there is a connection, retry if connection error"""
    global redis_client
    try:
        redis_client.ping()
    except redis.exceptions.ConnectionError:
        logger.warning(
            f"Redis connection was lost. Attempting immediate reconnection..."
        )
        try:
            time.sleep(QUICK_RETRY_DELAY)
            redis_client = redis.from_url(env.str("REDIS_URL"), decode_responses=True)
            redis_client.ping()
            logger.info("Reconnected to Redis successfully.")
        except redis.exceptions.ConnectionError:
            logger.warning(
                f"Immediate reconnection failed. Waiting {LONG_RETRY_DELAY} seconds before trying again..."
            )
            time.sleep(LONG_RETRY_DELAY)
            redis_client = redis.from_url(env.str("REDIS_URL"), decode_responses=True)


def set_key(key, value, ex=SHORT_TERM_CACHE_SECONDS):
    """
    Set a key-value pair in Redis with expiration based on the movie's age and data completeness.
    Falls back to short-term caching if any errors occur.
    """
    ensure_connection()

    try:
        cache_duration = determine_cache_duration(value)
    except Exception as e:
        logging.error(
            f"Error determining cache duration: {type(e).__name__}: {str(e)}. Falling back to short-term cache."
        )
        cache_duration = SHORT_TERM_CACHE_SECONDS

    return redis_client.set(key, json.dumps(value), ex=cache_duration)


def determine_cache_duration(data):
    """Determine the appropriate cache duration based on the movie's age and data completeness."""
    try:
        release_year = int(data["tmdb_data"]["year"])
        current_year = datetime.now().year
        years_since_release = current_year - release_year

        if years_since_release >= 4 and is_eligible_for_extended_cache(data):
            return LONG_TERM_CACHE_SECONDS
        elif years_since_release >= 2 and is_eligible_for_extended_cache(data):
            return MEDIUM_TERM_CACHE_SECONDS
        else:
            return SHORT_TERM_CACHE_SECONDS
    except Exception as e:
        logging.warning(
            f"Error in determine_cache_duration: {type(e).__name__}: {str(e)}. Using short-term cache."
        )
        return SHORT_TERM_CACHE_SECONDS


def is_eligible_for_extended_cache(data):
    """Check if the movie data is eligible for medium-term or long-term caching."""
    try:
        return (
            data["tmdb_data"]["media_type"] == "movie"
            and data["external_data"].get("letterboxd_url")
            and data["external_data"].get("rottentomatoes_url")
            and data["external_data"].get("imdb_url")
        )
    except Exception as e:
        logging.warning(
            f"Error in is_eligible_for_extended_cache: {type(e).__name__}: {str(e)}. Defaulting to not eligible."
        )
        return False


def get_key(key):
    """Get a value from Redis by key"""
    ensure_connection()
    try:
        value = redis_client.get(key)
        return json.loads(value) if value else None
    except redis.exceptions.ConnectionError:
        logger.error("Redis connection error. Falling bak to TMDB API")
        return None


def delete_key(key):
    """Delete a key from Redis"""
    ensure_connection()
    return redis_client.delete(key)
