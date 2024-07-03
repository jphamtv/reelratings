import React from 'react';
import freshIcon from '../assets/img/'

interface RatingsDetailsProps {
  imdbData: {
    url: string;
    rating: string | null;
  };
  rottenTomatoesData: {
    url: string;
    scores: {
      tomatometer: string | null;
      tomatometer_state: string;
      audience_score: string | null;
      audience_state: string;
    };
  };
  letterboxdData?: {
    url: string;
    rating: string | null;
  };
}

const RatingsDetails: React.FC<RatingsDetailsProps> = ({
  imdbData,
  rottenTomatoesData,
  letterboxdData
}) => { 
  const renderRottenTomatoes = () => {
    if (!rottenTomatoesData.url) return null;

    return (
      <a href={rottenTomatoesData.url} target="_blank" rel="noopener noreferrer">
        <div className="rottentomatoes-container card">
          <div className="tomatometer-wrapper">
            <div className="rating-box-wrapper-rt">
              <img 
                src={`/static/img/${getTomatoMeterImage(rottenTomatoesData.scores.tomatometer_state)}`} 
                className="rating-image-rt"
                alt="Tomatometer"
              />
              <p className={rottenTomatoesData.scores.tomatometer ? "rating" : "no_rating"}>
                {rottenTomatoesData.scores.tomatometer || "--"}
                {rottenTomatoesData.scores.tomatometer && "%"}
              </p>
            </div>
            <p className="label">Tomatometer</p>
          </div>
          <div className="audiencescore-wrapper">
            <div className="rating-box-wrapper-rt">
              <img 
                src={`/static/img/${getAudienceScoreImage(rottenTomatoesData.scores.audience_state)}`} 
                className="rating-image-rt"
                alt="Audience Score"
              />
              <p className={rottenTomatoesData.scores.audience_score ? "rating" : "no_rating"}>
                {rottenTomatoesData.scores.audience_score || "--"}
                {rottenTomatoesData.scores.audience_score && "%"}
              </p>
            </div>
            <p className="label">Audience Score</p>
          </div>
        </div>
      </a>
    );
  }; 

  const renderIMDb = () => (
    <a href={imdbData.url} target="_blank" rel="noopener noreferrer">
      <div className="imdb-wrapper card">
        <div className="rating-box-wrapper">
          <img 
            src={`/static/img/${imdbData.rating ? 'star.svg' : 'star-empty.svg'}`} 
            className="rating-image"
            alt="IMDb rating"
          />
          <p className={imdbData.rating ? "rating" : "no_rating"}>
            {imdbData.rating || "--"}
            {imdbData.rating && <span className="rating-scale">/10</span>}
          </p>
        </div>
        <p className="label">IMDb</p>
      </div>
    </a>
  );

  const renderLetterboxd = () => {
    if (!letterboxdData) return null;

    return (
      <a href={letterboxdData.url} target="_blank" rel="noopener noreferrer">
        <div className="letterbxd-wrapper card">
          <div className="rating-box-wrapper">
            <img 
              src={`/static/img/${letterboxdData.rating ? 'star-letterboxd.svg' : 'star-letterboxd-empty.svg'}`} 
              className="rating-image"
              alt="Letterboxd rating"
            />
            <p className={letterboxdData.rating ? "rating" : "no_rating"}>
              {letterboxdData.rating || "--"}
              {letterboxdData.rating && <span className="rating-scale">/5</span>}
            </p>
          </div>
          <p className="label">Letterboxd</p>
        </div>
      </a>
    );
  };

  return (
    <>
      {renderRottenTomatoes()}
      <div className="ratings-container">
        {renderIMDb()}
        {renderLetterboxd()}
      </div>
    </>
  );
};

function getTomatoMeterImage(state: string): string {
  switch (state) {
    case 'certfied-fresh': return 'certified_fresh.svg';
    case 'fresh': return 'tomatometer-fresh.svg';
    case 'rotten': return 'tomatometer-rotten.svg';
    default: return 'tomatometer-empty.svg';
  }
}

function getAudienceScoreImage(state: string): string {
  switch (state) {
    case 'upright': return 'aud_score-fresh.svg';
    case 'spilled': return 'aud_score-rotten.svg';
    default: return 'aud_score-empty.svg';
  }
}

export default RatingsDetails;