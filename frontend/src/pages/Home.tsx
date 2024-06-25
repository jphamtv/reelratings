import React from 'react';

const Home: React.FC = () => {
  return (
    <div class="homepage-container">
      <div class="homepage-logo-wrapper">
        <img src="/static/img/logo_yellow_v2.svg" class="homepage-logo">
          <div class="homepage-tagline">Get ratings for movies and TV shows</div>
      </div>
      <Search />
    </div>
  );
};

export default Home;