import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import posterEmptyLight from '../assets/img/poster_empty_light.jpg';
import posterEmptyDark from '../assets/img/poster_empty_dark.jpg';
import styles from './SearchResultItem.module.css';

interface SearchResultItemProps {
  tmdb_id: number;
  title: string;
  year: string;
  media_type: "movie" | "tv";
  poster_img: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  tmdb_id,
  title,
  year,
  media_type,
  poster_img
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { theme } = useTheme();
  const posterPlaceholder = theme === 'dark' ? posterEmptyDark : posterEmptyLight;
  const displayMediaType = media_type === "movie" ? "Movie" : media_type?.toUpperCase() || "TV";

  return (
    <li className={styles.searchResultItem}>
      <Link to={`/details/${tmdb_id}/${media_type}`}>
        <div className={styles.searchResultWrapper}>
          <div className={styles.posterContainer}>
            {!imageLoaded && <div className={styles.imagePlaceholder} />}
            <img
              src={poster_img || posterPlaceholder}
              alt={title}
              className={`${styles.posterImage} ${imageLoaded ? styles.loaded : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = posterPlaceholder;
                setImageLoaded(true);
              }}
            />
          </div>
          <div className={styles.titleDetailsWrapper}>
            <span className={styles.title}>{title}</span>
            {year && <span className={styles.year}> {year}</span>}
            <span className={styles.mediaType}> ({displayMediaType})</span>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default SearchResultItem;