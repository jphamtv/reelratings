import React from 'react';
import { Link } from 'react-router-dom';
import posterEmpty from '../assets/img/poster_empty.jpg'

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
    <li className="search-result-item">
      <Link to={`/details/${tmdb_id}/${media_type}`} className="search-result-item-link">
        <div className="search-result-wrapper">
          <img
            src={poster_img ? poster_img : posterEmpty}
            alt={title}
            className="poster-image"
          />
          <div className="title-details-wrapper">
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