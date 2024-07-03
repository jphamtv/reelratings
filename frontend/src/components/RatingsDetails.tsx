import React from 'react';
import imdbStar from '../assets/img/imdb_star.svg';
import imdbStarEmpty from '../assets/img/imdb_star_empty.svg';
import justwatchLogo from '../assets/img/justwatch_logo.svg';
import letterboxdStar from '../assets/img/letterboxd_star.svg';
import letterboxdStarEmpty from '../assets/img/letterboxd_star_empty.svg';
import tomatometerCertfiedFresh from '../assets/img/rt_tomatometer_certified_fresh.svg';
import tomatometerFresh from '../assets/img/rt_tomatometer_fresh.svg';
import tomatometerRotten from '../assets/img/rt_tomatometer_rotten.svg';
import tomatometerEmpty from '../assets/img/rt_tomatometer_empty.svg';
import audienceFresh from '../assets/img/rt_aud_score_fresh.svg';
import audienceRotten from '../assets/img/rt_aud_score_rotten.svg';
import audienceEmpty from '../assets/img/rt_aud_score_empty.svg';

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
                src={getTomatoMeterImage(rottenTomatoesData.scores.tomatometer_state)} 
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
                src={getAudienceScoreImage(rottenTomatoesData.scores.audience_state)} 
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
            src={imdbData.rating ? imdbStar : imdbStarEmpty} 
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
              src={letterboxdData.rating ? letterboxdStar : letterboxdStarEmpty} 
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
    case 'certified-fresh': return tomatometerCertfiedFresh;
    case 'fresh': return tomatometerFresh;
    case 'rotten': return tomatometerRotten;
    default: return tomatometerEmpty;
  }
}

function getAudienceScoreImage(state: string): string {
  switch (state) {
    case 'upright': return audienceFresh;
    case 'spilled': return audienceRotten;
    default: return audienceEmpty;
  }
}

export default RatingsDetails;