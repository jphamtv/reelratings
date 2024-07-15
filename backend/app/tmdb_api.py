import requests
import asyncio
import httpx

from datetime import datetime
from app.format_runtime_utils import format_runtime


# --------- HOMEPAGE - TRENDING MOVIES -------------- #


async def fetch_trending_movies(api_key):
    """Fetch top 100 trending movies of the week using the TMDB API"""
    base_url = f"https://api.themoviedb.org/3/trending/movie/week"
    poster_size = 'w500'

    async def fetch_page(page):
        url = f"{base_url}?language=en-US&api_key={api_key}&page={page}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()['results']

    # Fetch 5 pages concurrently
    pages = await asyncio.gather(*[fetch_page(i) for i in range(1, 6)])

    # Flatten the list of results
    all_movies = [movie for page in pages for movie in page]

    # Create a structure compatible with filter_api_data
    compatible_data = {"results": all_movies}

    # Filter and process the results
    filtered_movies = filter_api_data(compatible_data, poster_size)

    return filtered_movies


# --------- SEARCH FOR MOVIE OR TV SERIES -------------- #


def search_title(user_input, api_key):
    """Look up movie, TV shows, and people using the TMDB API"""
    title = user_input.replace(" ", "%20")
    url = f"https://api.themoviedb.org/3/search/multi?api_key={api_key}&query={title}&include_adult=false&language=en-US&page=1"
    search_results = fetch_api_data(url)
    poster_size = 'w185'
    filtered_results = filter_api_data(search_results, poster_size)

    return filtered_results


def fetch_api_data(url):
    """Make an HTTP GET request to TMDB API and return JSON data"""

    # Make the HTTP GET request
    response = requests.get(url)

    # Check that the request was successful (status code 2xx)
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
    if media_type == "movie":
        return {
            "tmdb_id": tmdb_id,
            "title": result.get("title"),
            "year": result.get("release_date")[0:4],
            "media_type": media_type.title(),
            "poster_img": poster_img,
        }

    elif media_type == "tv":
        return {
            "tmdb_id": tmdb_id,
            "title": result.get("name"),
            "year": result.get("first_air_date")[0:4],
            "media_type": media_type.upper(),
            "poster_img": poster_img,
        }


# --------- SEARCH TITLE DETAILS -------------- #


def get_common_details(media_details):
    """Extract common details for both Movie and TV series"""
    poster_path = media_details.get("poster_path")
    poster_img = (
        f"https://image.tmdb.org/t/p/w500{poster_path}"
        if poster_path
        else ""
    )
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

    return [{"id": item.get("id"), "name": item.get("name")} for item in movie_crew if item["job"] == "Director"]


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


def fetch_title_details(tmdb_id, media_type, api_key):
    """Fetch the details for the selected title and filter the results"""
    url = f"https://api.themoviedb.org/3/{media_type.lower()}/{tmdb_id}?api_key={api_key}&language=en-US&append_to_response=release_dates,watch/providers,external_ids,credits"
    media_details = fetch_api_data(url)
    poster_img, justwatch_url = get_common_details(media_details)

    if media_type == "Movie":
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

    elif media_type == "TV":
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

    return filtered_details


# --------- FETCH DIRECTOR MOVIES -------------- #


def fetch_director_movies(director_id, api_key):
    url = f"https://api.themoviedb.org/3/person/{director_id}/movie_credits?api_key={api_key}&language=en-US"
    data = fetch_api_data(url)

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
            "media_type": "Movie",
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
