import { Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import posterEmptyLight from "../assets/img/poster_empty_light.jpg";
import posterEmptyDark from "../assets/img/poster_empty_dark.jpg";
import commonSenseIconLight from "../assets/img/commonsense_checkmark_light.svg";
import commonSenseIconDark from "../assets/img/commonsense_checkmark_dark.svg";
import styles from "./TitleDetailsCard.module.css";

interface Director {
  id: number;
  name: string;
}

interface TitleDetailsCardProps {
  tmdbData: {
    imdb_id: string;
    media_type: "movie" | "tv";
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

const TitleDetailsCard: React.FC<TitleDetailsCardProps> = ({
  tmdbData,
  commonsenseData,
}) => {
  const {
    media_type,
    poster_img,
    title,
    certification,
    year,
    runtime,
    director,
    creator,
  } = tmdbData;
  const { theme } = useTheme();
  const posterPlaceholder =
    theme === "dark" ? posterEmptyDark : posterEmptyLight;

  const renderDirectorsOrCreators = () => {
    const people = media_type === "movie" ? director : creator;
    if (!people || people.length === 0) return null;

    const label = media_type === "movie" ? "Director" : "Creator";

    const renderPerson = (person: string | Director) => {
      if (typeof person === "string") {
        return person;
      } else {
        return (
          <Link
            to={`/search?director=${person.id}`}
            key={person.id}
            state={{ directorName: person.name }}
            className={styles.directorLink}
          >
            {person.name}
          </Link>
        );
      }
    };

    return (
      <div>
        {label}: {renderPerson(people[0])}
        {people[1] && <span>, {renderPerson(people[1])}</span>}
      </div>
    );
  };

  const renderCommonSenseInfo = () => {
    if (!commonsenseData) return null;

    const commonSenseIcon =
      theme === "dark" ? commonSenseIconDark : commonSenseIconLight;

    return (
      <a href={commonsenseData.url} target="_blank" rel="noopener noreferrer">
        <div className={styles.commonSenseWrapper}>
          <img
            src={commonSenseIcon}
            alt="Common Sense Media"
            className={styles.commonSenseIcon}
          />
          <div>{commonsenseData.rating}</div>
        </div>
      </a>
    );
  };

  return (
    <div className={styles.titleDetailsContainer}>
      <img
        src={poster_img || posterPlaceholder}
        alt={title}
        className={styles.posterImage}
      />
      <div className={styles.titleDetailsWrapper}>
        <h3>{title}</h3>
        <div>
          {certification && (
            <span className={styles.certifiedRating}>{certification}</span>
          )}
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
