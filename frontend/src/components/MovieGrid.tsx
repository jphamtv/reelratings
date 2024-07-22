import { Link } from 'react-router-dom';
import styles from './MovieGrid.module.css'; 

interface Movie {
  tmdb_id: number;
  title: string;
  media_type: "movie" | "tv";
  poster_img: string;
}

interface MovieGridProps {
  movies: Movie[];
  showPosters: boolean;
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, showPosters }) => (
  <div className={styles.movieGrid}>
    {movies.map((movie) => (
      <Link to={`/details/${movie.tmdb_id}/${movie.media_type}`} key={movie.tmdb_id}>
        <div className={styles.posterContainer}>
          <img
            src={movie.poster_img}
            alt={movie.title}
            className={`${styles.posterImage} ${showPosters ? styles.visible : ''}`}
          />
          {!showPosters && <div className={styles.posterSkeleton}></div>}
        </div>
      </Link>
    ))}
  </div>
);

export default MovieGrid;
