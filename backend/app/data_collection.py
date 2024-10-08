"""
This module handles data collection from various external sources such as
RottenTomatoes, Letterboxd, CommonSenseMedia, IMDb, and BoxOfficeMojo.
It provides functions to fetch and parse data from these sources.
"""
import httpx
import json
import logging

from bs4 import BeautifulSoup
from unidecode import unidecode
from app.utils.similar_utils import similar

BASE_URLS = {
    "rottentomatoes": "https://www.rottentomatoes.com/search?search=",
    "letterboxd": "https://letterboxd.com/s/search/",
    "commonsensemedia": "https://www.commonsensemedia.org/search/",
    "imdb": "https://www.imdb.com/title/",
    "boxofficemojo": "https://www.boxofficemojo.com/title/",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64; rv:12.0) " "Gecko/20100101 Firefox/12.0"
    ),
    "Accept-Language": "en-US",
    "Accept-Encoding": "gzip, deflate",
    "Accept": "text/html",
    "Referer": "https://www.google.com",
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


async def get_rottentomatoes_url(title, year, media_type):
    """Extract the RottenTomatoes URL for the title"""
    search_url = f"{BASE_URLS['rottentomatoes']}{title.replace(' ', '%20')}"
    soup = await make_request(search_url, HEADERS)
    if soup is None:
        return None

    title = unidecode(title)
    attribute_name = "releaseyear" if media_type == "movie" else "startyear"
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
    """Extract the Letterboxd URL for the movie"""
    search_url = f"{BASE_URLS['letterboxd']}{title.replace(' ', '+')}/"
    soup = await make_request(search_url, HEADERS)
    if soup is None:
        return None

    search_results = soup.find_all("span", {"class": "film-title-wrapper"})
    year = int(year)

    # Loop through to check exact year, then -/+ 1 year for discrepencies
    for check_year in [year, year - 1, year + 1]:
        for result in search_results:
            # Extract the text content
            year_element = result.find("small", class_="metadata")

            # If matched, get the href from the parent <a> tag
            if year_element and year_element.text.strip() == str(check_year):
                href = result.find("a")["href"]
                return f"https://letterboxd.com{href}"

    return None


async def get_commonsense_info(title, year, media_type):
    """Extract the title's specific URL page and age rating"""
    search_url = f"{BASE_URLS['commonsensemedia']}{title.replace(' ', '%20')}"
    soup = await make_request(search_url, HEADERS)
    if soup is None:
        return None
    search_results = soup.find_all("div", {"class": "site-search-teaser"})
    year = int(year)

    for result in search_results:
        # Check media type
        product_type_element = result.find(
            "div", class_="review-teaser-type caption"
        )
        product_type = (
            product_type_element.text.strip()
            if product_type_element is not None
            else None
        )
        if product_type != media_type.upper():
            continue

        # Check title similarity
        commonsense_title_element = result.find("h3", class_="review-teaser-title")
        commonsense_title = (
            commonsense_title_element.text.strip()
            if commonsense_title_element is not None
            else None
        )
        if not commonsense_title or similar(title.lower(), commonsense_title.lower()) < 0.79:
            continue

        # Check years
        for check_year in [year, year - 1, year + 1]:
            year_element = result.find("div", class_="review-product-summary")
            year_text = year_element.text.strip()[-5:-1]
            if year_text == str(check_year):
                # If there is a match, get rating and URL
                rating_age_element = result.find("span", {"class": "rating__age"})
                rating_age = (
                    rating_age_element.text.strip()
                    if rating_age_element is not None
                    else None
                )
                if not rating_age:
                    continue

                a_element = result.find("a")
                href = a_element["href"] if a_element is not None else None
                if not href:
                    continue

                return {
                    "url": f"https://www.commonsensemedia.org{href}",
                    "rating": rating_age,
                }

    return None


async def get_imdb_rating(imdb_id):
    """Extract the average user rating"""
    if imdb_id:
        imdb_url = f"{BASE_URLS['imdb']}{imdb_id}"
        soup = await make_request(imdb_url, HEADERS)
        if soup is None:
            return None

        # Locate the class that contains the IMDb Rating
        rating = soup.find(
            "div", {"data-testid": "hero-rating-bar__aggregate-rating__score"}
        )

        return rating.text[:-3] if rating else None
    else:
        return None


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

    # Locate the class that contains the Tomatometer and Audience scores
    try:
        rating = soup.find("meta", {"name": "twitter:data2"}).get("content")
    except AttributeError:
        rating = None

    return round(float(rating[0:5]), 1) if rating else None
