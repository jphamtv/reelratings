import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchTrendingMovies } from '../services/api';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import reelRatingsLogo from '../assets/img/reelratings_logo_yellow.svg';
import styles from './HomePage.module.css';

interface Movie {
  tmdb_id: number;
  title: string;
  year: string;
  media_type: "Movie" | "TV";
  poster_img: string;
}

const HomePage: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await fetchTrendingMovies();
        console.log(response)
        setTrendingMovies(response.results);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
   }, []);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error || trendingMovies.length === 0) {
    return <p className={styles.errorMessage}>Error fetching movies.</p>;
  }

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
        <main>
          <div className={styles.moviesContainer}>
            <h3 className={styles.title}>Popular Movies This Week</h3>
            <div className={styles.movieGrid}>
            {trendingMovies.map((result) => (
              <Link to={`/details/${result.tmdb_id}/${result.media_type}`}>
                <img src={result.poster_img} alt={result.title} className={styles.posterImage}/>
              </Link>
            ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;