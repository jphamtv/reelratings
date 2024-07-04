import React from 'react';
import commonSenseIcon from '../assets/img/commonsense_checkmark.svg'

interface TitleDetailsCardProps {
  tmdbData: {
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
  commonsenseData?: {
    url: string;
    rating: string;
  };
}

const TitleDetailsCard: React.FC<TitleDetailsCardProps> = ({ tmdbData, commonsenseData }) => { 
  const { media_type, poster_img, title, certification, year, runtime, director, creator } = tmdbData;

  const renderDirectorsOrCreators = () => { 
    const people = media_type === 'Movie' ? director : creator;
    if (!people || people.length === 0) return null;

    const label = media_type === 'Movie' ? 'Director' : 'Creator';  
    return (
      <div>{label}: {people[0]}{people[1] && <span>, {people[1]}</span>}</div>
    );
  };

  const renderCommonSenseInfo = () => {
    if (!commonsenseData) return null;

    return (
      <a href={commonsenseData.url} target="_blank" rel="noopener noreferrer">
        <div className="commonsense-wrapper">
          <img src={commonSenseIcon} alt="Common Sense Media" className="commonsense-icon" />
          <div>{commonsenseData.rating}</div>
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
          {certification && <span className='certification'>{certification}</span>}
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