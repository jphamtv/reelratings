"""
This module handles data collection from various external sources such as
RottenTomatoes, Letterboxd, CommonSenseMedia, IMDb, and BoxOfficeMojo.
It provides functions to fetch and parse data from these sources.
"""
import asyncio
import httpx
import json
import logging
import re

from curl_cffi.requests import AsyncSession
from environs import Env

from bs4 import BeautifulSoup
from unidecode import unidecode
from app.utils.similar_utils import similar

env = Env()
env.read_env()
OMDB_API_KEY = env.str("OMDB_API_KEY", "")

BASE_URLS = {
    "rottentomatoes": "https://www.rottentomatoes.com/search?search=",
    "commonsensemedia": "https://www.commonsensemedia.org/search/",
    "imdb": "https://www.imdb.com/title/",
    "boxofficemojo": "https://www.boxofficemojo.com/title/",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.5",
}


"""
Makes an asynchronous HTTP GET request and parses the response with BeautifulSoup.
Handles various exceptions and logs errors.

:param url: The URL to request.
:param headers: Optional HTTP headers for the request.
:return: BeautifulSoup object of the parsed HTML content, or None if request fails.
"""


async def make_request(url, headers=None):
    try:
        # Create an asynchronous HTTP client
        async with httpx.AsyncClient(
            timeout=15, limits=httpx.Limits(max_connections=10)
        ) as client:
            # Make the HTTP GET request
            response = await client.get(url, headers=headers, follow_redirects=True)

            # Check that the request was successful (status code 2xx)
            response.raise_for_status()

            # Parse the HTML content of the response with BeautifulSoup
            return BeautifulSoup(response.content, "html.parser")
    except httpx.RequestError as exc:
        # Log any exception specific to HTTPX
        logging.error(f"HTTPX Request Error: {exc}")
    except Exception as generic_exc:
        # Log any other generic exceptions
        logging.error(f"Generic Exception: {generic_exc}")

    return None


async def make_letterboxd_request(url):
    """Makes a request to Letterboxd using browser TLS impersonation to bypass bot detection."""
    try:
        async with AsyncSession() as session:
            response = await session.get(url, impersonate="chrome124")
            response.raise_for_status()
            return BeautifulSoup(response.content, "html.parser")
    except Exception as exc:
        logging.error(f"Letterboxd Request Error: {exc}")
    return None


async def get_rottentomatoes_url(title, year, media_type):
    """Extract the RottenTomatoes URL for the title"""
    search_url = f"{BASE_URLS['rottentomatoes']}{title.replace(' ', '%20')}"
    soup = await make_request(search_url, HEADERS)
    if soup is None:
        return None

    title = unidecode(title)
    attribute_name = "release-year" if media_type == "movie" else "startyear"
    year = int(year)

    for result in soup.find_all("search-page-media-row"):
        rt_title = result.find("a", {"data-qa": "info-name"}).text.strip()
        try:
            rt_year = int(result.get(attribute_name, 0))
        except ValueError:
            continue

        # Check year proximity
        if abs(rt_year - year) <= 1:
            # Check title similarity
            if similar(title.lower(), rt_title.lower()) > 0.79:
                url_tag = result.find("a", {"data-qa": "thumbnail-link"})
                rottentomatoes_url = url_tag["href"]
                return rottentomatoes_url

    return None


async def get_letterboxd_url(title, year):
    """Resolve a Letterboxd film URL by constructing the slug directly.

    The search endpoint is gated by Cloudflare, but `/film/<slug>/` pages
    are reachable with a plain request. Letterboxd slugs are deterministic
    (ASCII-normalized, lowercased, non-alphanumerics collapsed to hyphens).
    For titles with no name conflict the bare slug works; for conflicts
    Letterboxd appends `-<year>`. TMDB and Letterboxd can disagree on the
    release year (especially for anime / foreign films), so we tolerate
    ±2 years on the page-year check and probe the same ±2 window when
    falling back to the year-suffixed variant.
    """
    slug = unidecode(title).lower().replace("'", "")
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    if not slug:
        return None

    year = int(year)

    bare_url = f"https://letterboxd.com/film/{slug}/"
    soup = await make_request(bare_url, HEADERS)
    if soup is not None:
        title_meta = soup.find("meta", {"name": "twitter:title"})
        if title_meta:
            year_match = re.search(r"\((\d{4})\)", title_meta.get("content", ""))
            if year_match and abs(int(year_match.group(1)) - year) <= 2:
                return bare_url

    for delta in (0, -1, 1, -2, 2):
        candidate_url = f"https://letterboxd.com/film/{slug}-{year + delta}/"
        if await make_request(candidate_url, HEADERS) is not None:
            return candidate_url

    return None


async def get_commonsense_info(title, year, media_type):
    """Extract the title's specific URL page and age rating using direct URL approach"""

    # Create URL slug from title
    slug = title.lower()
    # Remove apostrophes (don't replace with hyphens)
    slug = slug.replace("'", "")
    # Replace spaces and other special characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')

    # Construct direct URL based on media type
    if media_type.lower() == "movie":
        url = f"https://www.commonsensemedia.org/movie-reviews/{slug}"
        year_class = "detail--release-dates-theaters"
    elif media_type.lower() == "tv":
        url = f"https://www.commonsensemedia.org/tv-reviews/{slug}"
        year_class = "detail--premiere-date"
    else:
        return None

    # Fetch the page
    soup = await make_request(url, HEADERS)
    if soup is None:
        return None

    # Extract year from HTML element (different class for movies vs TV)
    page_year = None
    year_element = soup.find("span", class_=year_class)
    if year_element:
        year_text = year_element.get_text().strip()
        # Extract 4-digit year from date text (e.g., "February 14, 1931" → 1931)
        year_match = re.search(r'\b(19|20)\d{2}\b', year_text)
        if year_match:
            page_year = int(year_match.group())

    # Verify year matches within ±2 tolerance (for foreign/animation release discrepancies)
    if page_year:
        expected_year = int(year)
        if abs(page_year - expected_year) > 2:
            return None

    # Extract rating from HTML span element
    rating = None
    rating_element = soup.find("span", {"class": "rating__age"})
    if rating_element:
        rating_text = rating_element.text.strip()
        # Extract just the age number (e.g., "age 14+" -> "14+")
        age_match = re.search(r'(\d+\+?)', rating_text)
        if age_match:
            rating = age_match.group(1)

    if rating:
        return {
            "url": url,
            "rating": rating,
        }

    return None


async def get_imdb_rating(imdb_id):
    """Extract IMDb rating and Metascore via OMDb API"""
    if not imdb_id:
        return None

    if not OMDB_API_KEY:
        logging.error("OMDB_API_KEY not set")
        return None

    url = f"https://www.omdbapi.com/?i={imdb_id}&apikey={OMDB_API_KEY}"
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
    except Exception as exc:
        logging.error(f"OMDb API Error: {exc}")
        return None

    imdb_rating = data.get("imdbRating")
    metascore = data.get("Metascore")

    return {
        "imdb_rating": imdb_rating if imdb_rating != "N/A" else None,
        "metascore": metascore if metascore != "N/A" else None,
    }


async def get_boxofficemojo_url(imdb_id):
    boxofficemojo_url = f"{BASE_URLS['boxofficemojo']}{imdb_id}/"
    return boxofficemojo_url


async def get_box_office_amounts(imdb_id):
    """Extract box office amounts"""
    if imdb_id:
        url = f"{BASE_URLS['boxofficemojo']}{imdb_id}/"
        soup = await make_request(url, HEADERS)
        if soup is None:
            return None

        # Locate the span element that contains the Box Office amounts
        span_elements = soup.find_all("span", class_="a-size-medium a-text-bold")
        dollar_amounts = [span.get_text(strip=True) for span in span_elements]
        return dollar_amounts
    else:
        return None


async def get_justwatch_page(justwatch_url):
    """Extract the JustWatch page url for 'US'"""
    if justwatch_url:
        soup = await make_request(justwatch_url, HEADERS)
        if soup is None:
            return None

        try:
            link = soup.find("div", class_="homepage")
        except AttributeError:
            link = None

        return link.find("a")["href"] if link else None


async def get_rottentomatoes_scores(rottentomatoes_url):
    """Extract Tomotometer and Audience Scores"""
    if not rottentomatoes_url:
        return None

    # Get the script element that contains the Tomatometer and Audience scores
    soup = await make_request(rottentomatoes_url, HEADERS)
    if soup is None:
        return None

    script_tag = soup.find("script", {"id": "media-scorecard-json"})
    if not script_tag:
        return None

    # Convert data string to dictionary
    json_data = json.loads(script_tag.string)

    # Get the Tomatometer and Audience Score objects
    tomatometer = json_data["criticsScore"] if "criticsScore" in json_data else None
    audience_score = (
        json_data["audienceScore"] if "audienceScore" in json_data else None
    )

    tomatometer_state = None
    audience_state = None

    if tomatometer:
        if "sentiment" not in tomatometer or "score" not in tomatometer:
            tomatometer_state = None
        elif (
            tomatometer["certified"] == True 
            and tomatometer["sentiment"] == "POSITIVE"
        ):
            tomatometer_state = "certified-fresh"
        elif (
            tomatometer["certified"] == False and tomatometer["sentiment"] == "POSITIVE"
        ):
            tomatometer_state = "fresh"
        elif (
            tomatometer["certified"] == False and tomatometer["sentiment"] == "NEGATIVE"
        ):
            tomatometer_state = "rotten"

    if audience_score:
        if "sentiment" not in audience_score or "score" not in audience_score:
            audience_state = None
        elif (
            audience_score["certified"] == True
            and audience_score["sentiment"] == "POSITIVE"
        ):
            audience_state = "verified-hot"
        elif (
            audience_score["certified"] == False
            and audience_score["sentiment"] == "POSITIVE"
        ):
            audience_state = "upright"
        elif (
            audience_score["certified"] == False
            and audience_score["sentiment"] == "NEGATIVE"
        ):
            audience_state = "spilled"

    if tomatometer is None and audience_score is None:
        return None

    return {
        "tomatometer": (
            tomatometer["score"] 
            if tomatometer and "score" in tomatometer
            else None
        ),
        "tomatometer_state": tomatometer_state,
        "audience_score": (
            audience_score["score"]
            if audience_score and "score" in audience_score
            else None
        ),
        "audience_state": audience_state,
    }


async def get_letterboxd_rating(letterboxd_url):
    """Extract the average user rating"""
    if not letterboxd_url:
        return None

    soup = await make_request(letterboxd_url, HEADERS)
    if soup is None:
        return None

    try:
        rating = soup.find("meta", {"name": "twitter:data2"}).get("content")
    except AttributeError:
        rating = None

    return round(float(rating.split()[0]), 1) if rating else None


def _extract_watchlist_movies(soup):
    """Parse title/year pairs from the grid items on a single watchlist page."""
    movies = []
    for item in soup.find_all("li", class_="griditem"):
        # Extract data-item-name which contains "Title (Year)" format
        poster_div = item.find("div")
        if poster_div and poster_div.get("data-item-name"):
            item_name = poster_div.get("data-item-name")

            # Parse "Title (Year)" format using regex
            match = re.match(r"(.+?)\s*\((\d{4})\)$", item_name)
            if match:
                movies.append({
                    "title": match.group(1).strip(),
                    "year": match.group(2),
                })
    return movies


async def scrape_letterboxd_watchlist(username):
    """
    Scrape a Letterboxd watchlist for a given username, across all pages.

    Letterboxd paginates watchlists (28 items per page at time of writing).
    The first page's `.paginate-pages` block lists every page number, so we
    read the highest one and fetch the remaining pages concurrently rather
    than relying on a fixed per-page count.

    :param username: Letterboxd username
    :return: dict with 'movies' (list of {'title', 'year'}), or error dict
    """
    base_url = f"https://letterboxd.com/{username}/watchlist/"
    soup = await make_letterboxd_request(base_url)

    if soup is None:
        return {"error": "Unable to fetch watchlist. Please check the username and try again."}

    # Check if the page is a 404 (username not found)
    if soup.find("h1", string="404 Page not found"):
        return {"error": "Username not found. Please check the username and try again."}

    # Check if watchlist is private
    if soup.find("p", string=re.compile("This watchlist is private", re.IGNORECASE)):
        return {"error": "This watchlist is private and cannot be accessed."}

    # Find all grid items (movies in watchlist)
    if not soup.find_all("li", class_="griditem"):
        return {"error": "No movies found in watchlist or watchlist is empty."}

    # Determine the last page number from the pagination block (absent = single page)
    last_page = 1
    pagination = soup.find("div", class_="paginate-pages")
    if pagination:
        page_numbers = [
            int(text)
            for li in pagination.find_all("li", class_="paginate-page")
            if (text := li.get_text(strip=True)).isdigit()
        ]
        if page_numbers:
            last_page = max(page_numbers)

    movies = _extract_watchlist_movies(soup)

    # Fetch any remaining pages concurrently and append their movies in order
    if last_page > 1:
        remaining = await asyncio.gather(
            *(
                make_letterboxd_request(f"{base_url}page/{page}/")
                for page in range(2, last_page + 1)
            )
        )
        for page_soup in remaining:
            if page_soup is not None:
                movies.extend(_extract_watchlist_movies(page_soup))

    if not movies:
        return {"error": "Could not extract movie data from watchlist."}

    logging.info(f"Successfully scraped {len(movies)} movies from {username}'s watchlist")
    return {"movies": movies}
