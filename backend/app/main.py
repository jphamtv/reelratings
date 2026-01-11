import logging
import redis
import traceback

from environs import Env
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.external_data import get_movie_data, get_tv_show_data
from app.redis_client import set_key, get_key
from app.tmdb_api import (
    fetch_title_details,
    search_title,
    fetch_trending_movies,
    fetch_director_movies,
    fetch_actor_movies,
)
from app.data_collection import scrape_letterboxd_watchlist

# Version declaration
__version__ = "2.0.3"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)

# Initialize environment variables
env = Env()
env.read_env()

TMDB_API_KEY = env.str("TMDB_API_KEY")
REFRESH_API_KEY = env.str("REFRESH_API_KEY")
ENVIRONMENT = env.str("ENVIRONMENT", "production")  # Default to production

# Initialize FastAPI app
app = FastAPI()

# Configure CORS origins based on environment
allowed_origins = [
    "https://getreelratings.com",
    "https://www.getreelratings.com",
]

# Add localhost for development
if ENVIRONMENT == "development":
    allowed_origins.extend([
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative port
    ])
    logger.info("Development mode: CORS enabled for localhost")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    if ENVIRONMENT == "production":
        # Only import scheduler in production to avoid dependency issues in development
        from app.cache_manager import start_scheduler
        scheduler = start_scheduler()
        app.state.scheduler = scheduler
        logger.info("Scheduler started for production environment")
    else:
        app.state.scheduler = None
        logger.info("Scheduler disabled in development mode - use /api/refresh-trending endpoint to manually update cache")


@app.on_event("shutdown")
def shutdown_event():
    if app.state.scheduler:
        app.state.scheduler.shutdown()


@app.get("/api/trending")
async def trending_movies() -> dict:
    try:
        # Try to get cached movies first
        cached_movies = get_key("trending_movies")
        if cached_movies:
            return {"results": cached_movies}

        # If not in cache, fetch from TMDB API
        movies = await fetch_trending_movies(TMDB_API_KEY)

        # Cache the fetched movies
        set_key("trending_movies", movies)

        return {"results": movies}
    except redis.exceptions.ConnectionError:
        logging.error("Redis connection error. Falling back to TMDB API.")
        movies = await fetch_trending_movies(TMDB_API_KEY)
        return {"results": movies}
    except Exception as e:
        logging.error(f"Search error: {type(e).__name__}: {str(e)}.")
        raise HTTPException(status_code=500, detail="Error fetching movies")


# Function to manually trigger fetching trending movies
@app.get("/api/refresh-trending/{api_key}")
async def refresh_trending_movies(api_key: str) -> dict:
    if api_key != REFRESH_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    try:
        movies = await fetch_trending_movies(TMDB_API_KEY)
        set_key("trending_movies", movies)
        return {"message": "Trending movies cache refreshed"}
    except Exception as e:
        logging.error(
            f"Error refreshing trending movies cache: {type(e).__name__}: {str(e)}."
        )
        raise HTTPException(
            status_code=500, detail="Error refreshing trending movies cache"
        )


@app.get("/api/search")
async def search(query: str) -> dict:
    try:
        search_results = await search_title(query, TMDB_API_KEY)
        return {"results": search_results}
    except Exception as e:
        logging.error(f"Search error: {type(e).__name__}: {str(e)}.")
        raise HTTPException(status_code=500, detail="Error performing search")


@app.get("/api/director/{director_id}")
async def director_movies(director_id: str) -> dict:
    try:
        movies = await fetch_director_movies(director_id, TMDB_API_KEY)
        return {"results": movies}
    except Exception as e:
        logging.error(
            f"Error fetching director's movies: {type(e).__name__}: {str(e)}."
        )
        raise HTTPException(status_code=500, detail="Error fetching director's movies")


@app.get("/api/actor/{actor_id}")
async def actor_movies(actor_id: str) -> dict:
    try:
        movies = await fetch_actor_movies(actor_id, TMDB_API_KEY)
        return {"results": movies}
    except Exception as e:
        logging.error(
            f"Error fetching actor's movies: {type(e).__name__}: {str(e)}."
        )
        raise HTTPException(status_code=500, detail="Error fetching actor's movies")


@app.get("/api/letterboxd-watchlist/{username}")
async def letterboxd_watchlist(username: str) -> dict:
    try:
        # Scrape Letterboxd watchlist
        watchlist_data = await scrape_letterboxd_watchlist(username)

        # Check for errors from scraping
        if "error" in watchlist_data:
            if "not found" in watchlist_data["error"].lower():
                raise HTTPException(status_code=404, detail=watchlist_data["error"])
            elif "private" in watchlist_data["error"].lower():
                raise HTTPException(status_code=403, detail=watchlist_data["error"])
            else:
                raise HTTPException(status_code=500, detail=watchlist_data["error"])

        movies = watchlist_data.get("movies", [])
        if not movies:
            return {"results": []}

        # Search TMDB for each movie and find best match by year
        results = []
        for movie in movies:
            title = movie["title"]
            year = movie["year"]

            try:
                # Search TMDB
                search_results = await search_title(title, TMDB_API_KEY)

                # Filter by year (exact match or ±1 year for discrepancies)
                year_int = int(year)
                best_match = None
                for result in search_results:
                    result_year = int(result.get("year", 0))
                    if abs(result_year - year_int) <= 1 and result.get("media_type") == "movie":
                        best_match = result
                        break

                if best_match:
                    results.append(best_match)
                else:
                    logging.warning(f"No TMDB match found for {title} ({year})")
            except Exception as e:
                logging.error(f"Error searching TMDB for {title} ({year}): {type(e).__name__}: {str(e)}")
                continue

        return {"results": results}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(
            f"Error fetching Letterboxd watchlist: {type(e).__name__}: {str(e)}."
        )
        raise HTTPException(status_code=500, detail="Error fetching Letterboxd watchlist")


@app.get("/api/details/{tmdb_id}/{media_type}")
async def title_details(tmdb_id: str, media_type: str) -> dict:
    cached_key = f"details_{tmdb_id}_{media_type}"
    cached_data = get_key(cached_key)

    if cached_data:
        logging.info("Fetched from redis cache")
        return cached_data

    try:
        # Fetch title details from TMDB API
        tmdb_data = await fetch_title_details(tmdb_id, media_type, TMDB_API_KEY)

        # Only create imdb_url if imdb_id exists
        imdb_url = (
            f"https://www.imdb.com/title/{tmdb_data['imdb_id']}"
            if tmdb_data["imdb_id"]
            else None
        )

        # Movie specific info
        if media_type == "movie":
            external_data = await get_movie_data(
                tmdb_data["imdb_id"],
                tmdb_data["title"],
                tmdb_data["year"],
                media_type,
                tmdb_data["justwatch_url"],
            )
        # TV show specific info
        elif media_type == "tv":
            external_data = await get_tv_show_data(
                tmdb_data["imdb_id"],
                tmdb_data["title"],
                tmdb_data["year"],
                media_type,
                tmdb_data["justwatch_url"],
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid media type")

        external_data_model = {
            "imdb_url": imdb_url,
            **external_data,
        }

        result_data = {"tmdb_data": tmdb_data, "external_data": external_data_model}

        set_key(cached_key, result_data)
        logging.info("Fetched from external_data.py")
        return result_data
    except Exception as e:
        logging.error(f"Error fetching details: {type(e).__name__}: {str(e)}.")
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching title details: {type(e).__name__}: {str(e)}.",
        )


# Error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logging.error(f"An HTTP exception occurred: {exc}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def internal_server_error(request: Request, exc: Exception):
    logging.error(f"An error occurred: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
