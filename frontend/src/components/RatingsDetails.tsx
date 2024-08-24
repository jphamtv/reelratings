import imdbStar from "../assets/img/imdb_star.svg";
import imdbStarEmpty from "../assets/img/imdb_star_empty.svg";
import letterboxdStar from "../assets/img/letterboxd_star.svg";
import letterboxdStarEmpty from "../assets/img/letterboxd_star_empty.svg";
import tomatometerCertfiedFresh from "../assets/img/rt_tomatometer_certified_fresh.svg";
import tomatometerFresh from "../assets/img/rt_tomatometer_fresh.svg";
import tomatometerRotten from "../assets/img/rt_tomatometer_rotten.svg";
import tomatometerEmpty from "../assets/img/rt_tomatometer_empty.svg";
import audienceVerifiedHot from "../assets/img/rt_aud_score_verified_hot.svg"
import audienceFresh from "../assets/img/rt_aud_score_fresh.svg";
import audienceRotten from "../assets/img/rt_aud_score_rotten.svg";
import audienceEmpty from "../assets/img/rt_aud_score_empty.svg";
import styles from "./RatingsDetails.module.css";

interface RatingsDetailsProps {
  imdbData?: {
    url: string;
    rating: string | null;
  };
  rottenTomatoesData?: {
    url: string;
    scores: {
      tomatometer: string | null;
      tomatometer_state: string | null;
      audience_score: string | null;
      audience_state: string | null;
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
  letterboxdData,
}) => {
  const renderRottenTomatoes = () => {
    if (!rottenTomatoesData?.url) return null;

    return (
      <a
        href={rottenTomatoesData.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className={`${styles.rottenTomatoesContainer} card`}>
          <RatingScore
            score={rottenTomatoesData.scores.tomatometer}
            state={rottenTomatoesData.scores.tomatometer_state}
            label="Tomatometer"
            getImage={getTomatoMeterImage}
          />
          <RatingScore
            score={rottenTomatoesData.scores.audience_score}
            state={rottenTomatoesData.scores.audience_state}
            label="Popcornmeter"
            getImage={getAudienceScoreImage}
          />
        </div>
      </a>
    );
  };

  const renderIMDb = () => {
    if (!imdbData?.url) return null;

    return (
      <a
        href={imdbData.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.ratingLink}
      >
        <div className={`${styles.ratingContainer} card`}>
          <div className={styles.ratingBoxWrapper}>
            <img
              src={imdbData.rating ? imdbStar : imdbStarEmpty}
              className={styles.ratingImage}
              alt="IMDb rating"
            />
            <p className={imdbData.rating ? styles.rating : styles.noRating}>
              {imdbData.rating || "--"}
              {imdbData.rating && (
                <span className={styles.ratingScale}>/10</span>
              )}
            </p>
          </div>
          <p className={styles.label}>IMDb</p>
        </div>
      </a>
    );
  };

  const renderLetterboxd = () => {
    if (!letterboxdData?.url) return null;

    return (
      <a
        href={letterboxdData.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.ratingLink}
      >
        <div className={`${styles.ratingContainer} card`}>
          <div className={styles.ratingBoxWrapper}>
            <img
              src={letterboxdData.rating ? letterboxdStar : letterboxdStarEmpty}
              className={styles.ratingImage}
              alt="Letterboxd rating"
            />
            <p
              className={
                letterboxdData.rating ? styles.rating : styles.noRating
              }
            >
              {letterboxdData.rating || "--"}
              {letterboxdData.rating && (
                <span className={styles.ratingScale}>/5</span>
              )}
            </p>
          </div>
          <p className={styles.label}>Letterboxd</p>
        </div>
      </a>
    );
  };

  return (
    <>
      {renderRottenTomatoes()}
      <div className={styles.ratingsContainer}>
        {renderIMDb()}
        {renderLetterboxd()}
      </div>
    </>
  );
};

interface RatingScoreProps {
  score: string | null;
  state: string | null;
  label: string;
  getImage: (state: string | null) => string;
}

const RatingScore: React.FC<RatingScoreProps> = ({
  score,
  state,
  label,
  getImage,
}) => (
  <div className={styles.scoreWrapper}>
    <div className={styles.scoreBoxWrapper}>
      <img
        src={getImage(state)}
        className={styles.rottenTomatoesRatingImage}
        alt={label}
      />
      <p className={score ? styles.rating : styles.noRating}>
        {score || "--"}
        {score && "%"}
      </p>
    </div>
    <p className={styles.label}>{label}</p>
  </div>
);

function getTomatoMeterImage(state: string | null): string {
  switch (state) {
    case "certified-fresh":
      return tomatometerCertfiedFresh;
    case "fresh":
      return tomatometerFresh;
    case "rotten":
      return tomatometerRotten;
    default:
      return tomatometerEmpty;
  }
}

function getAudienceScoreImage(state: string | null): string {
  switch (state) {
    case "verified-hot":
      return audienceVerifiedHot;
    case "upright":
      return audienceFresh;
    case "spilled":
      return audienceRotten;
    default:
      return audienceEmpty;
  }
}

export default RatingsDetails;
