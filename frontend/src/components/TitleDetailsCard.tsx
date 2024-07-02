import React from 'react';

interface TitleDetailsCardProps {
  tmdb_data: {
    imdb_id: string;
    media_type: "Movie" | "TV";
    title: string;
    year: string;
    poster_img: string;
    justwatch_url: string;
    director?: string[];
    runtime?: string;
    certification?: string;
    creator?: string[];
  };
  external_data: {
    commonsense_info?: {
      url: string;
      rating: string;
    };
  };
}

const TitleDetailsCard: React.FC<TitleDetailsCardProps> = ({ tmdb_data, external_data }) => { 
  const { media_type, poster_img, title, certification, year, runtime, director, creator } = tmdb_data;
  const { commonsense_info } = external_data;

  const renderDirectorsOrCreators = () => { 
    const people = media_type === 'Movie' ? director : creator;
    if (!people) return null;

    const label = media_type === 'Movie' ? 'Director' : 'Creator';  
    return (
      <div>{label}: {people[0]}{people[1] && <span>, {people[1]}</span>}</div>
    );
  };

  const renderCommonSenseInfo = () => {
    if (!commonsense_info) return null;

    return (
      <a href={commonsense_info.url} target="_blank" rel="noopener noreferrer">
        <div className="commonsense-wrapper">
          <img src="/static/img/logo-checkmark-green.svg" className="commonsense-icon" />
          <div>{commonsense_info.rating}</div>
        </div>
      </a>
    );
  };

  return (
    <div className="title-details-container">
      <img src={poster_img} alt={title} className="poster-image" />
      <div className="title-details-wrapper">
        <h3>{title}</h3>
        <div>
          {certification && <span className='certfication'>{certification}</span>}
          {year}
          {runtime && ` • ${runtime}`}
        </div>
        {renderDirectorsOrCreators()}
        {renderCommonSenseInfo()}
      </div>
    </div>
  );
};

export default TitleDetailsCard;