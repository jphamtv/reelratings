import React from 'react';
import { Link } from 'react-router-dom';
import posterPlaceholder from '../assets/img/poster_empty.jpg'
import styles from './SearchResultItem.module.css';
import sharedStyles from '../assets/css/sharedStyles.module.css';

interface SearchResultItemProps {
  key: number;
  tmdb_id: number;
  title: string;
  year: string;
  media_type: string;
  poster_img: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  tmdb_id,
  title,
  year,
  media_type,
  poster_img
}) => {
  return (
    <li className={styles.searchResultItem}>
      <Link to={`/details/${tmdb_id}/${media_type}`} className={styles.searchResultLink}>
        <div className={styles.searchResultWrapper}>
          <img
            src={poster_img ? poster_img : posterPlaceholder}
            alt={title}
            className={sharedStyles.posterImage}
          />
          <div className={sharedStyles.titleDetailsWrapper}>
            <h3>{title}</h3>
            {year && <p>{year}</p>}
            <p>{media_type}</p>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default SearchResultItem;