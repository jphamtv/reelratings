import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import SearchResultItem from '../components/SearchResultItem';

const SearchPage: React.FC = () => {

  const Loading = () => {
    return (
      <div id="loading" style="display: none">
        <div className="empty-state-details-container">
          <div className="empty-state-poster"></div>
          <div className="empty-state-details-wrapper">
            <div className="empty-state-info"></div>
            <div className="empty-state-info"></div>
            <div className="empty-state-info"></div>
          </div>
        </div>
        <div className="empty-state-card">
        </div>
        <div className="empty-state-card">
        </div>
        <div className="empty-state-card">
        </div>
      </div>
    );
  };

  const Error = () => { 
    return (
      {/* {% elif not search_results %} */}
        <p className="error-message">Bummer, no matches for that title. Check the spelling and try again.</p>
      {/* {% endif %} */}
    );
  };

  return (
      <>
        <Helmet>
          <title>Search Results | ReelRatings</title>
        </Helmet>
        <Layout>
          <SearchBar />
          <div className='search-list-container'>
            {/* Search results */}
          </div>
        </Layout>
      </>
  );
};

export default SearchPage;