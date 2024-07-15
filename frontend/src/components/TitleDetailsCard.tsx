import posterPlaceholder from '../assets/img/poster_empty.jpg'
import commonSenseIcon from '../assets/img/commonsense_checkmark.svg';
import styles from './TitleDetailsCard.module.css';

interface Director {
  id: number;
  name: string;
}

interface TitleDetailsCardProps {
  tmdbData: {
    imdb_id: string;
    media_type: "Movie" | "TV";
    title: string;
    year: string;
    poster_img: string;
    justwatch_url: string;
    director?: Director[] | string[];
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

    const getName = (person: string | Director) =>
      typeof person === 'string' ? person : person.name;

    return (
      <div>
        {label}: {getName(people[0])}
        {people[1] && <span>, {getName(people[1])}</span>}
      </div>
    );
  };

  const renderCommonSenseInfo = () => {
    if (!commonsenseData) return null;

    return (
      <a href={commonsenseData.url} target="_blank" rel="noopener noreferrer">
        <div className={styles.commonSenseWrapper}>
          <img src={commonSenseIcon} alt="Common Sense Media" className={styles.commonSenseIcon} />
          <div>{commonsenseData.rating}</div>
        </div>
      </a>
    );
  };

  return (
    <div className={styles.titleDetailsContainer}>
      <img src={poster_img || posterPlaceholder} alt={title} className={styles.posterImage} />
      <div className={styles.titleDetailsWrapper}>
        <h3>{title}</h3>
        <div>
          {certification && <span className={styles.certifiedRating}>{certification}</span>}
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