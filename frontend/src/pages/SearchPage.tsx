import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useClientCache } from '../hooks/useClientCache';
import { searchTitle } from '../services/api';
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

  useEffect(() => {
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

    const query = new URLSearchParams(location.search).get('query');
    if (query) {
      fetchSearchResults(query);
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  }, [location.search, getItem, setItem]);
  

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error || searchResults.length === 0) {
    return <p className={styles.errorMessage}>Bummer, no matches for that title. Check the spelling and try again.</p>;
  }

  return (
      <>
        <Helmet>
          <title>Search Results | ReelRatings</title>
        </Helmet>
        <div className={styles.searchResultsContainer}>
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