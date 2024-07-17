import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useClientCache } from '../hooks/useClientCache';
import { useSearch } from '../hooks/useSearch';
import { fetchTrendingMovies } from '../services/api';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import reelRatingsLogo from '../assets/img/reelratings_logo_yellow.svg';
import styles from './HomePage.module.css';

interface TrendingMovie {
  tmdb_id: number;
  title: string;
  year: string;
  media_type: "Movie" | "TV";
  poster_img: string;
}

interface TrendingMoviesResponse {
  results: TrendingMovie[];
}

const HomePage: React.FC = () => {
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPosters, setShowPosters] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const { getItem, setItem } = useClientCache();
  const { setSearchValue } = useSearch();

  useEffect(() => {
    if (hasFetched) return;

    // Clear search value when HomePage mounts
    setSearchValue('');

    const fetchMovies = async () => {
      const cacheKey = 'trending_movies';
      const cachedMovies = getItem<TrendingMoviesResponse>(cacheKey);

      if (cachedMovies && Array.isArray(cachedMovies.results)) {
        console.log('Data source: Local Storage');
        setTrendingMovies(cachedMovies.results);
        setLoading(false);
        setTimeout(() => setShowPosters(true), 100);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        const movies = await fetchTrendingMovies();
        if (movies && Array.isArray(movies.results)) {
          console.log(`Data source: ${movies.source}`);
          setTrendingMovies(movies.results);
          setItem(cacheKey, movies)
        } else {
          throw new Error('Invalid reponse format');
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError(true);
      } finally {
        setLoading(false);
        setTimeout(() => setShowPosters(true), 100);
      }
    };

    fetchMovies();
    setHasFetched(true);
  }, [getItem, setItem, setSearchValue, hasFetched]);
  
  const renderMovieGrid = () => (
    <div className={styles.movieGrid}>
      {trendingMovies.map((movie) => (
        <Link to={`/details/${movie.tmdb_id}/${movie.media_type}`} key={movie.tmdb_id}>
          <img
            src={movie.poster_img}
            alt={movie.title}
            className={`${styles.posterImage} ${showPosters ? styles.visible : ''}`} />
        </Link>
      ))}
    </div>
  );
  
  const renderSkeletonGrid = () => (
    <div className={styles.movieGrid}>
      {Array.from({ length: 20 }).map((_, index) => (
        <div key={index} className={styles.posterSkeleton} />
      ))}
    </div>
   );

  if (loading) {
    return (
      <div className={styles.loadingBackground}>
        <img src={reelRatingsLogo} className={styles.loadingAndErrorLogo}></img>
      </div>
    );
  }

  if (error || trendingMovies.length === 0) {
    return (
      <div className={styles.errorBackground}>
        <img src={reelRatingsLogo} className={styles.loadingAndErrorLogo}></img>
        <p className={styles.errorMessage}>Movie and TV show data is currently unavailable. Please try reloading the page.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>ReelRatings | Movie and TV Ratings</title>
      </Helmet>
      <div className={styles.homepageBody}>
        <div className={styles.homepageContainer}>
          <div className={styles.logoWrapper}>
            <img src={reelRatingsLogo} className={styles.logo} alt="Reel Ratings" />
            <div className={styles.tagline}>Get ratings for movies and TV shows</div>
          </div>
          <SearchBar className={styles.homePageSearchContainer} />
        </div>
        <main className={styles.homepageMain}>
          <div className={styles.moviesContainer}>
            <h3 className={styles.title}>Trending Movies This Week</h3>
            {loading ? renderSkeletonGrid() : renderMovieGrid()}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;