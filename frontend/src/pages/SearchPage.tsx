import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { searchTitles } from '../services/api';
import SearchResultItem from '../components/SearchResultItem';
import styles from './SearchPage.module.css';

interface SearchResult {
  tmdb_id: number;
  title: string;
  year: string;
  media_type: string;
  poster_img: string;
}

const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('query');
    if (query) {
      fetchSearchResults(query);
    }
  }, [location.search]);
  
  const fetchSearchResults = async (query: string) => {
    try {
      setLoading(true);
      const response = await searchTitles(query);
      setSearchResults(response.results);
      console.log(`response: ${response}`)
    } catch (err) {
      setError('Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  };

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