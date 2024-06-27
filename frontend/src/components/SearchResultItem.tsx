import React from 'react';

interface SearchResultItemProps {
  image: string;
  title: string;
  year: string;
  mediaType: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  image,
  title,
  year,
  mediaType
}) => {
  return (
    // {% if search_results %}
    <ul>
      {/* {% for item in search_results %} */}
      <li className="search-result-item">
        <a href="/details/{{ item.tmdb_id }}/{{ item.media_type }}" className="search-result-item-link">
          <div className="search-result-wrapper">
            <img src={image} alt={title} className="poster-image" />
            <div className="title-details-wrapper">
              <h3>{{ title }}</h3>
              {/* {% if item.year %} */}
              <p>{{ year }}</p>
              {/* {% endif %} */}
              <p>{{ mediaType }}</p>
            </div>
          </div>
        </a>
      </li>
      {/* {% endfor %} */}
    </ul>
  );
};

export default SearchResultItem;