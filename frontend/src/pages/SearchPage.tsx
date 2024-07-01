import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { searchTitles } from '../services/api';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import SearchResultItem from '../components/SearchResultItem';

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
      console.log('API response:', response);
      setSearchResults(response.results);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  };

  const renderLoading = () => {
    <div id="loading">Loading...</div>
  };

  const renderError = () => { 
    <p className="error-message">Bummer, no matches for that title. Check the spelling and try again.</p>    
  };

  if (loading) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  return (
      <>
        <Helmet>
          <title>Search Results | ReelRatings</title>
        </Helmet>
        <div className='search-list-container'>
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