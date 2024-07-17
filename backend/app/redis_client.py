import json
import logging
import redis
from environs import Env

logger = logging.getLogger(__name__)

env = Env()
env.read_env()

redis_client = redis.from_url(env.str("REDIS_URL"), decode_responses=True)

def set_key(key, value, expiration=86400):
    """Set a key-value pair in Redis with expiration in seconds (default 1 day)"""
    return redis_client.set(key, json.dumps(value), ex=expiration)

def get_key(key):
    """Get a value from Redis by key"""
    try:
        value = redis_client.get(key)
        return json.loads(value) if value else None
    except redis.exceptions.ConnectionError:
        logger.error("Redis connection error. Falling bak to TMDB API")
        return None

def delete_key(key):
    """Delete a key from Redis"""
    return redis_client.delete(key)
