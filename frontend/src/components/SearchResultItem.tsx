import { Link } from 'react-router-dom';
import posterPlaceholder from '../assets/img/poster_empty.jpg'
import styles from './SearchResultItem.module.css';

interface SearchResultItemProps {
  key: number;
  tmdb_id: number;
  title: string;
  year: string;
  media_type: "Movie" | "TV";
  poster_img: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  key,
  tmdb_id,
  title,
  year,
  media_type,
  poster_img
}) => {
  return (
    <li className={styles.searchResultItem} key={key}>
      <Link to={`/details/${tmdb_id}/${media_type}`} className={styles.searchResultLink}>
        <div className={styles.searchResultWrapper}>
          <img
            src={poster_img ? poster_img : posterPlaceholder}
            alt={title}
            className={styles.posterImage}
          />
          <div className={styles.titleDetailsWrapper}>
            <span className={styles.title}>{title}</span>
            {year && <span className={styles.year}> {year}</span>}
            <span className={styles.mediaType}> ({media_type})</span>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default SearchResultItem;