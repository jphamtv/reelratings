import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useClientCache } from '../hooks/useClientCache';
import { searchTitle, fetchDirectorMovies } from '../services/api';
import SearchResultItem from '../components/SearchResultItem';
import styles from './SearchPage.module.css';

interface SearchResult {
  tmdb_id: number;
  title: string;
  year: string;
  media_type: "Movie" | "TV";
  poster_img: string;
}

interface SearchResponse {
  results: SearchResult[];
}

const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const location = useLocation();
  const { getItem, setItem } = useClientCache();

  // Get directorName from location state
  const directorName = location.state?.directorName || null;

  useEffect(() => {

    // Search for title
    const fetchSearchResults = async (query: string) => {
      const cacheKey = `search_${query}`;
      const cachedResults = getItem<SearchResponse>(cacheKey);
  
      if (cachedResults && Array.isArray(cachedResults.results)) {
        setSearchResults(cachedResults.results);
        setLoading(false);
        return;
      }
  
      try {
        setLoading(true);
        setError(false);
        const response = await searchTitle(query);
        console.log(response);
        if (response && Array.isArray(response.results)) {
          setSearchResults(response.results);
          setItem(cacheKey, response);
        } else {
          throw new Error('Invalid search results format');
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    // Search for director movies
    const fetchDirectorMoviesData = async (directorId: string) => {
      const cacheKey = `director_${directorId}`;
      const cachedResults = getItem<SearchResponse>(cacheKey);

      if (cachedResults && Array.isArray(cachedResults.results)) {
        setSearchResults(cachedResults.results);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        console.log('SearchPage 1 directorID:', typeof directorId)
        const response = await fetchDirectorMovies(directorId);
        console.log(response);
        if (response && Array.isArray(response.results)) {
          setSearchResults(response.results);
          setItem(cacheKey, response);
        } else {
          throw new Error('Invalid director movies format');
        }
      } catch (err) {
        console.error("Error fetching director's movies:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('query');
    const directorId = searchParams.get('director');

    if (query) {
      fetchSearchResults(query);
    } else if (directorId) {
      console.log('SearchPage 2 directorID:', typeof directorId)
      fetchDirectorMoviesData(directorId);
    } else {
      setSearchResults([]);
      setLoading(false);
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

  if (error || searchResults.length === 0) {
    return <p className={styles.errorMessage}>Bummer, no matches for that title. Check the spelling and try again.</p>;
  }

  return (
      <>
        <Helmet>
          <title>{directorName ? `Movies by ${directorName}` : 'Search Results'} | ReelRatings</title>
        </Helmet>
        <div className={styles.searchResultsContainer}>
          {directorName && <h3 className={styles.directorName}>Movies directed by {directorName}</h3>}
          <ul>
            {searchResults.map((result) => (
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

export default SearchPage;