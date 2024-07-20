import asyncio
import httpx
import logging

from datetime import datetime
from app.external_data import get_movie_data
from app.utils.format_runtime_utils import format_runtime
from app.utils.throttled_fetch_utils import throttled_fetch
from app.redis_client import set_key, get_key


# --------- HOMEPAGE - TRENDING MOVIES -------------- #


async def fetch_trending_movies(api_key):
    """Fetch top 100 trending movies of the week using the TMDB API"""
    base_url = f"https://api.themoviedb.org/3/trending/movie/week"
    poster_size = "w500"

    async def fetch_page(page):
        url = f"{base_url}?language=en-US&api_key={api_key}&page={page}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()["results"]

    # Fetch 5 pages concurrently
    pages = await asyncio.gather(*[fetch_page(i) for i in range(1, 6)])

    # Flatten the list of results
    all_movies = [movie for page in pages for movie in page]

    # Create a structure compatible with filter_api_data
    compatible_data = {"results": all_movies}

    # Filter and process the results
    filtered_movies = filter_api_data(compatible_data, poster_size)

    try:
        # Fetch and cache details for each movie, limited to 5 for testing
        await cache_trending_movie_details(filtered_movies, api_key)
        logging.info("Completed caching process for trending movies")
    except Exception as e:
        logging.error(f"Error caching movie details: {str(e)}")

    return filtered_movies


async def cache_trending_movie_details(movies, api_key):
    async def fetch_and_cache(movie):
        tmdb_id = movie["tmdb_id"]
        media_type = movie["media_type"]
        cache_key = f"details_{tmdb_id}_{media_type}"

        # Check if details are already in cache
        cached_details = get_key(cache_key)
        if cached_details:
            return

        try:
            # Fetch TMDB details
            tmdb_data = await fetch_title_details(tmdb_id, media_type, api_key)
            logging.info(f"Successfully fetched TMDB data for movie {tmdb_id}")

            try:
                # Fetch external data
                external_data = await get_movie_data(
                    tmdb_data["imdb_id"],
                    tmdb_data["title"],
                    tmdb_data["year"],
                    media_type,
                    tmdb_data["justwatch_url"],
                )
                logging.info(f"Successfully fetched external data for movie {tmdb_id}")

                # Add IMDB url to external_data
                imdb_url = (
                    f"https://www.imdb.com/title/{tmdb_data['imdb_id']}"
                    if tmdb_data["imdb_id"]
                    else None
                )
                external_data_model = {
                    "imdb_url": imdb_url,
                    **external_data,
                }

                # Combine TMDB and external data
                full_details = {
                    "tmdb_data": tmdb_data,
                    "external_data": external_data_model,
                }

                # Cache the combined data
                set_key(cache_key, full_details)
                logging.info(
                    f"Cached full details for movie: {tmdb_data['title']} ({tmdb_data['year']})"
                )
            except Exception as e:
                logging.error(
                    f"Error processing external data for {tmdb_data['title']} - TMDB ID {tmdb_id}: {str(e)}",
                    exc_info=True,
                )

        except Exception as e:
            logging.error(
                f"Error fetching TMDB data for movie {tmdb_id}: {str(e)}", exc_info=True
            )

    # # Process only the first 'limit' movies for testing
    # limited_movies = movies[30:35]
    # await throttled_fetch(fetch_and_cache, limited_movies)
    await throttled_fetch(fetch_and_cache, movies)

    logging.info(f"Processed {len(movies)} movies for caching")


# --------- SEARCH FOR MOVIE OR TV SERIES -------------- #


async def search_title(user_input, api_key):
    """Look up movie, TV shows, and people using the TMDB API"""
    title = user_input.replace(" ", "%20")
    url = f"https://api.themoviedb.org/3/search/multi?api_key={api_key}&query={title}&include_adult=false&language=en-US&page=1"
    search_results = await fetch_api_data(url)
    poster_size = "w185"
    filtered_results = filter_api_data(search_results, poster_size)

    return filtered_results


async def fetch_api_data(url):
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


def filter_api_data(api_data, poster_size):
    """Filter the API data based on media type"""
    poster_base_url = f"https://www.themoviedb.org/t/p/{poster_size}"
    seen_tmdb_ids = set()
    filtered_results = []

    for result in api_data["results"]:
        tmdb_id = result.get("id")
        poster_path = result.get("poster_path")
        media_type = result.get("media_type") or "movie"
        poster_img = get_poster_image(poster_base_url, poster_path)

        # Check if TMDB id is already seen to avoid duplicates
        if tmdb_id not in seen_tmdb_ids:
            seen_tmdb_ids.add(tmdb_id)
            filtered_result = get_filtered_results(
                result, media_type, tmdb_id, poster_img
            )

            if filtered_result:
                filtered_results.append(filtered_result)

    return filtered_results


def get_poster_image(poster_base_url, poster_path):
    # Use image placeholder if no poster file path exists
    if poster_path is None:
        return ""
    else:
        return f"{poster_base_url}{poster_path}"


def get_filtered_results(result, media_type, tmdb_id, poster_img):
    """Get the filtered result based on media type"""
    if media_type == "movie" and result.get("release_date"):
        return {
            "tmdb_id": tmdb_id,
            "title": result.get("title"),
            "year": result.get("release_date")[0:4],
            "media_type": media_type,
            "poster_img": poster_img,
        }

    elif media_type == "tv" and result.get("first_air_date"):
        return {
            "tmdb_id": tmdb_id,
            "title": result.get("name"),
            "year": result.get("first_air_date")[0:4],
            "media_type": media_type,
            "poster_img": poster_img,
        }


# --------- SEARCH TITLE DETAILS -------------- #


def get_common_details(media_details):
    """Extract common details for both Movie and TV series"""
    poster_path = media_details.get("poster_path")
    poster_img = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""
    justwatch_url = get_justwatch_url(media_details)

    return poster_img, justwatch_url


def get_runtime(media_details):
    """Get runtime and format it"""
    runtime = media_details.get("runtime")

    return format_runtime(runtime) if runtime else None


def get_movie_details(media_details):
    """Extract details specific to Movie"""
    imdb_id = media_details.get("imdb_id")
    title = media_details.get("title")
    year = media_details.get("release_date")[0:4]
    runtime = get_runtime(media_details) or None
    director = get_director(media_details) or None
    certification = get_certification(media_details) or None

    return imdb_id, title, year, runtime, director, certification


def get_tv_details(media_details):
    """Extract details specific to TV"""
    imdb_id = media_details.get("external_ids")["imdb_id"]
    title = media_details.get("name")
    year = media_details.get("first_air_date")[0:4]
    creator = get_creator(media_details) or None

    return imdb_id, title, year, creator


def get_director(media_details):
    """Get director(s) for movies"""
    movie_crew = media_details.get("credits", {}).get("crew", [])

    return [
        {"id": item.get("id"), "name": item.get("name")}
        for item in movie_crew
        if item["job"] == "Director"
    ]


def get_creator(media_details):
    """Get creator(s) for TV series"""
    return [item.get("name") for item in media_details.get("created_by", [])]


def get_certification(media_details):
    """Get movie certification rating for 'US'"""
    release_results = media_details.get("release_dates", {}).get("results", [])

    for result in release_results:
        if result["iso_3166_1"] == "US":
            for release_date in result["release_dates"]:
                certification = release_date["certification"]

                if certification:
                    return certification

    return None


def get_justwatch_url(media_details):
    """Get the URL for the title's JustWatch TMDB page for 'US'"""
    providers = media_details.get("watch/providers", {}).get("results")

    try:
        justwatch_url = providers["US"]["link"]
    except KeyError:
        justwatch_url = None

    return justwatch_url


async def fetch_title_details(tmdb_id, media_type, api_key):
    try:
        """Fetch the details for the selected title and filter the results"""
        url = f"https://api.themoviedb.org/3/{media_type}/{tmdb_id}?api_key={api_key}&language=en-US&append_to_response=release_dates,watch/providers,external_ids,credits"
        media_details = await fetch_api_data(url)
        poster_img, justwatch_url = get_common_details(media_details)

        if media_type == "movie":
            imdb_id, title, year, runtime, director, certification = get_movie_details(
                media_details
            )
            filtered_details = {
                "director": director,
                "imdb_id": imdb_id,
                "media_type": media_type,
                "title": title,
                "year": year,
                "runtime": runtime,
                "certification": certification,
                "poster_img": poster_img,
                "justwatch_url": justwatch_url,
            }

        elif media_type == "tv":
            imdb_id, title, year, creator = get_tv_details(media_details)
            filtered_details = {
                "creator": creator,
                "imdb_id": imdb_id,
                "media_type": media_type,
                "title": title,
                "year": year,
                "poster_img": poster_img,
                "justwatch_url": justwatch_url,
            }
        else:
            raise ValueError(f"Invalid media type: {media_type}")

        return filtered_details
    except Exception as e:
        logging.error(f"Error in fetch_title_details for {tmdb_id}")
        raise


# --------- FETCH DIRECTOR MOVIES -------------- #


async def fetch_director_movies(director_id, api_key):
    url = f"https://api.themoviedb.org/3/person/{director_id}/movie_credits?api_key={api_key}&language=en-US"
    data = await fetch_api_data(url)

    # Filter for movies where the person was a director
    directed_movies = [movie for movie in data["crew"] if movie["job"] == "Director"]

    # Sort movies by release date (newest first)
    sorted_movies = sorted(
        directed_movies,
        key=lambda x: (
            datetime.strptime(x["release_date"], "%Y-%m-%d")
            if x["release_date"]
            else datetime.min
        ),
        reverse=True,
    )

    # Format the results
    formatted_movies = [
        {
            "tmdb_id": movie["id"],
            "title": movie["title"],
            "year": movie["release_date"][:4] if movie["release_date"] else None,
            "media_type": "movie",
            "poster_img": (
                f"https://image.tmdb.org/t/p/w185{movie['poster_path']}"
                if movie["poster_path"]
                else None
            ),
        }
        for movie in sorted_movies
        if movie["release_date"] and movie["release_date"][:4]
    ]

    return formatted_movies
