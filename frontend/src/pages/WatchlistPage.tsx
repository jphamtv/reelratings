import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useClientCache } from "../hooks/useClientCache";
import { fetchLetterboxdWatchlist } from "../services/api";
import SearchResultItem from "../components/SearchResultItem";
import styles from "./SearchPage.module.css";

interface WatchlistResult {
  tmdb_id: number;
  title: string;
  year: string;
  media_type: "movie" | "tv";
  poster_img: string;
}

interface WatchlistResponse {
  results: WatchlistResult[];
}

const WatchlistPage: React.FC = () => {
  const [watchlistResults, setWatchlistResults] = useState<WatchlistResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const { getItem, setItem } = useClientCache();

  useEffect(() => {
    const fetchWatchlist = async (username: string) => {
      const cacheKey = `letterboxd_watchlist_${username}`;
      const cachedResults = getItem<WatchlistResponse>(cacheKey);

      if (cachedResults && Array.isArray(cachedResults.results)) {
        setWatchlistResults(cachedResults.results);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        setErrorMessage("");
        const response = await fetchLetterboxdWatchlist(username);
        if (response && Array.isArray(response.results)) {
          setWatchlistResults(response.results);
          setItem(cacheKey, response);
        } else {
          throw new Error("Invalid watchlist results format");
        }
      } catch (err: unknown) {
        console.error("Error fetching watchlist:", err);
        setError(true);

        // Handle specific error messages
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Unable to fetch watchlist. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    const searchParams = new URLSearchParams(location.search);
    const username = searchParams.get("username");

    if (username) {
      fetchWatchlist(username);
    } else {
      setWatchlistResults([]);
      setLoading(false);
      setError(true);
      setErrorMessage("No username provided.");
    }
  }, [location.search, getItem, setItem]);

  if (loading) {
    return (
      <div className={styles.searchResultsContainer}>
        <div className={styles.loading}></div>
        <div className={styles.loading}></div>
        <div className={styles.loading}></div>
        <div className={styles.loading}></div>
        <div className={styles.loading}></div>
      </div>
    );
  }

  if (error || watchlistResults.length === 0) {
    return (
      <p className={styles.errorMessage}>
        {errorMessage || "No movies found in watchlist."}
      </p>
    );
  }

  const searchParams = new URLSearchParams(location.search);
  const username = searchParams.get("username") || "";

  return (
    <>
      <Helmet>
        <title>{`${username}'s Letterboxd Watchlist | ReelRatings`}</title>
      </Helmet>
      <div className={styles.searchResultsContainer}>
        <h3 className={styles.searchResultsTitle}>
          {username}'s Letterboxd Watchlist
        </h3>
        <ul>
          {watchlistResults.map((result) => (
            <SearchResultItem
              key={result.tmdb_id}
              tmdb_id={result.tmdb_id}
              title={result.title}
              year={result.year}
              media_type={result.media_type}
              poster_img={result.poster_img}
            />
          ))}
        </ul>
      </div>
    </>
  );
};

export default WatchlistPage;
