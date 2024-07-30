import json
import logging
import redis
import redis.exceptions
import time
from environs import Env

logger = logging.getLogger(__name__)

env = Env()
env.read_env()

REDIS_EXPIRATION = 23 * 60 * 60 + 54 * 60  # 23 hours and 54 minutes in seconds
QUICK_RETRY_DELAY = 0.1  # 100 milliseconds
LONG_RETRY_DELAY = 2  # 2 seconds

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


def set_key(key, value, expiration=REDIS_EXPIRATION):
    """Set a key-value pair in Redis with expiration in seconds (default 1 day)"""
    ensure_connection()
    return redis_client.set(key, json.dumps(value), ex=expiration)


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
