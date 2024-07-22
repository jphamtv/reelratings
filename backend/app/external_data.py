import asyncio

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

async def get_movie_data(
    imdb_id: str, title: str, year: str, media_type: str, justwatch_url: str
) -> dict:
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


async def get_tv_show_data(
    imdb_id: str, title: str, year: str, media_type: str, justwatch_url: str
) -> dict:
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
