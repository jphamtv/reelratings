import asyncio
import logging
import traceback

from environs import Env
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.data_collection import (
    get_imdb_rating,
    get_rottentomatoes_url,
    get_rottentomatoes_scores,
    get_letterboxd_url,
    get_letterboxd_rating,
    get_commonsense_info,
    get_boxofficemojo_url,
    get_box_office_amounts,
    get_justwatch_page,
)
from app.tmdb_api import fetch_title_details, search_title, fetch_trending_movies

# Initialize environment variables
env = Env()
env.read_env()

TMDB_API_KEY = env.str("TMDB_API_KEY")

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # TODO: Add frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],    
)

# Error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logging.error(f"An HTTP exception occurred: {exc}")
    return {"error": str(exc), "status_code": exc.status_code}


@app.exception_handler(Exception)
async def internal_server_error(request: Request, exc: Exception):
    logging.error(f"An error occurred: {exc}")
    return {"error": "Internal Server Error", "status_code": 500}


# API routes
@app.get("/api/trending")
def trending_movies():
    try:
        movies = fetch_trending_movies(TMDB_API_KEY)
        return {"results": movies}
    except Exception as e:
        logging.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching movies")


@app.get("/api/search")
def search(query: str):
    try:
        search_results = search_title(query, TMDB_API_KEY)
        return {"results": search_results}
    except Exception as e:
        logging.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error performing search")


@app.get("/api/details/{tmdb_id}/{media_type}")
async def title_details(tmdb_id: str, media_type: str):
    try:
        # Fetch title details from TMDB API
        tmdb_data = fetch_title_details(tmdb_id, media_type, TMDB_API_KEY)

        imdb_url = f"https://www.imdb.com/title/{tmdb_data['imdb_id']}"

        # Movie specific info
        if media_type == "Movie":
            external_data = await get_movie_info(
                tmdb_data["imdb_id"],
                tmdb_data["title"],
                tmdb_data["year"],
                media_type,
                tmdb_data["justwatch_url"],
            )
        # TV show specific info
        elif media_type == "TV":
            external_data = await get_tv_info(
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

        return {
            # "details": details,
            "tmdb_data": tmdb_data,
            "external_data": external_data_model
        }
    except Exception as e:
        logging.error(f"Error fetching details: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Error fetching title details: {str(e)}"},
        )


async def get_movie_info(
    imdb_id: str, title: str, year: str, media_type: str, justwatch_url: str
):
    """Execute asynchronous tasks specifically for movies."""
    # Initialize tasks
    boxofficemojo_url = asyncio.create_task(get_boxofficemojo_url(imdb_id))
    rottentomatoes_url = asyncio.create_task(
        get_rottentomatoes_url(title, year, media_type)
    )
    letterboxd_url = asyncio.create_task(get_letterboxd_url(title, year))
    justwatch_page = asyncio.create_task(get_justwatch_page(justwatch_url))
    box_office_amounts = asyncio.create_task(get_box_office_amounts(imdb_id))
    imdb_rating = asyncio.create_task(get_imdb_rating(imdb_id))
    commonsense_info = asyncio.create_task(
        get_commonsense_info(title, year, media_type)
    )

    # Fetch scores immediately after URL is fetched
    rottentomatoes_url = await rottentomatoes_url
    rottentomatoes_scores = asyncio.create_task(
        get_rottentomatoes_scores(rottentomatoes_url)
    )

    # Fetch rating immediately after URL is fetched
    letterboxd_url = await letterboxd_url
    letterboxd_rating = asyncio.create_task(get_letterboxd_rating(letterboxd_url))

    # Await tasks
    imdb_rating = await imdb_rating
    boxofficemojo_url = await boxofficemojo_url
    box_office_amounts = await box_office_amounts
    commonsense_info = await commonsense_info
    justwatch_page = await justwatch_page if justwatch_url else None
    rottentomatoes_scores = await rottentomatoes_scores
    letterboxd_rating = await letterboxd_rating

    return {
        "imdb_rating": imdb_rating,
        "rottentomatoes_url": rottentomatoes_url,
        "rottentomatoes_scores": rottentomatoes_scores,
        "letterboxd_url": letterboxd_url,
        "letterboxd_rating": letterboxd_rating,
        "commonsense_info": commonsense_info,
        "boxofficemojo_url": boxofficemojo_url,
        "box_office_amounts": box_office_amounts,
        "justwatch_page": justwatch_page,
    }


async def get_tv_info(
    imdb_id: str, title: str, year: str, media_type: str, justwatch_url: str
):
    """Execute asynchronous tasks specifically for TV shows."""
    # Initialize async tasks
    justwatch_page = asyncio.create_task(get_justwatch_page(justwatch_url))
    rottentomatoes_url = asyncio.create_task(
        get_rottentomatoes_url(title, year, media_type)
    )
    imdb_rating = asyncio.create_task(get_imdb_rating(imdb_id))
    commonsense_info = asyncio.create_task(
        get_commonsense_info(title, year, media_type)
    )

    # Fetch scores immediately after URL is fetched
    rottentomatoes_url = await rottentomatoes_url
    rottentomatoes_scores = asyncio.create_task(
        get_rottentomatoes_scores(rottentomatoes_url)
    )

    # Await tasks
    imdb_rating = await imdb_rating
    commonsense_info = await commonsense_info
    justwatch_page = await justwatch_page if justwatch_url else None
    rottentomatoes_scores = await rottentomatoes_scores

    return {
        "imdb_rating": imdb_rating,
        "rottentomatoes_url": rottentomatoes_url,
        "rottentomatoes_scores": rottentomatoes_scores,
        "commonsense_info": commonsense_info,
        "justwatch_page": justwatch_page,
        "letterboxd_url": None,
        "letterboxd_rating": None,
        "boxofficemojo_url": None,
        "box_office_amounts": None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
