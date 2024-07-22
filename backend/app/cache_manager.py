"""
This module manages the caching of trending movies data using a scheduler.
It periodically updates the cache to ensure fresh data is available.
"""
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.redis_client import set_key
from app.tmdb_api import fetch_trending_movies
from environs import Env
import logging

logger = logging.getLogger(__name__)

env = Env()
env.read_env()

TMDB_API_KEY = env.str("TMDB_API_KEY")

"""
Fetches trending movies from TMDB API and updates the Redis cache.
Logs success or failure of the operation.
"""
async def update_trending_movies_cache():
    try:
        movies = await fetch_trending_movies(TMDB_API_KEY)
        set_key("trending_movies", movies)
        logging.info("Trending movies cache updated successfully")
    except Exception as e:
        logging.error(f"Error updating trending movies cache: {str(e)}")

"""
Initializes and starts the AsyncIOScheduler to periodically update the trending movies cache.
Returns the initialized scheduler object.
"""
def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        update_trending_movies_cache,
        trigger=CronTrigger(hour=3, minute=0),  # Run daily at 3AM
        id="update_trending_movies_cache",
        name="Update trending movies cache",
        replace_existing=True,
    )
    logger.info("Scheduler started, cache will update daily at 3:00 AM")
    scheduler.start()
    return scheduler
