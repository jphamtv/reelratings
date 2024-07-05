import React from 'react';
import { Helmet } from 'react-helmet';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import reelRatingsLogo from '../assets/img/reelratings_logo_yellow.svg';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>ReelRatingsDB | Movie and TV Ratings</title>
      </Helmet>
      <div className={styles.homepageBody}>
        <div className={styles.homepageContainer}>
          <div className={styles.logoWrapper}>
            <img src={reelRatingsLogo} className={styles.logo} alt="Reel Ratings" />
            <div className={styles.tagline}>Get ratings for movies and TV shows</div>
          </div>
          <SearchBar className={styles.homePageSearchContainer} />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;