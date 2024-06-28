import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { searchTitles } from '../services/api';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import SearchResultItem from '../components/SearchResultItem';

const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState(null);
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
      const results = await searchTitles(query);
      setSearchResults(results);
    } catch (err) {
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
        <Layout>
          <SearchBar className='search-container' />
          <div className='search-list-container'>
            <ul>
              {searchResults.map((result) => (
                <SearchResultItem
                  image={result.img}
                  title={result.title}
                  year={result.year}
                  mediaType={result.mediaType}
                />
              ))}
            </ul>
          </div>
        </Layout>
      </>
  );
};

export default SearchPage;