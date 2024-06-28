import React from 'react';
import { Helmet } from 'react-helmet';
import SearchBar from '../components/SearchBar';
import logoYellow from '../assets/img/logo_yellow.svg';

const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>ReelRatingsDB | Movie and TV Ratings</title>
      </Helmet>
      <div className="homepage-body">
        <div className="homepage-container">
          <div className="homepage-logo-wrapper">
            <img src={logoYellow} className="homepage-logo" alt="Logo" />
            <div className="homepage-tagline">Get ratings for movies and TV shows</div>
          </div>
          <div className="homepage-search-container">
            <SearchBar className="homepage-search-margin" />
          </div>
        </div>
        <footer>
          <p className="homepage-footer">© 2024 ReelRatings</p>
        </footer>
      </div>
    </>
  );
};

export default HomePage;