import { Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import posterEmptyLight from "../assets/img/poster_empty_light.jpg";
import posterEmptyDark from "../assets/img/poster_empty_dark.jpg";
import styles from "./TitleDetailsCard.module.css";

interface Director {
  id: number;
  name: string;
}

interface Actor {
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
    cast?: Actor[];
    runtime?: string;
    certification?: string;
    creator?: string[];
  };
}

const TitleDetailsCard: React.FC<TitleDetailsCardProps> = ({
  tmdbData,
}) => {
  const {
    media_type,
    poster_img,
    title,
    certification,
    year,
    runtime,
    director,
    cast,
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
            className={styles.castCrewLink}
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

  const renderActors = () => {
    // Only show actors for movies
    if (media_type !== "movie" || !cast || cast.length === 0) return null;

    const renderActor = (actor: Actor) => {
      return (
        <Link
          to={`/search?actor=${actor.id}`}
          key={actor.id}
          state={{ actorName: actor.name }}
          className={styles.castCrewLink}
        >
          {actor.name}
        </Link>
      );
    };

    return (
      <div>
        Actors: {renderActor(cast[0])}
        {cast[1] && <span key={`comma-${cast[1].id}`}>, {renderActor(cast[1])}</span>}
        {cast[2] && <span key={`comma-${cast[2].id}`}>, {renderActor(cast[2])}</span>}
      </div>
    );
  };

  const getFullResPosterUrl = (posterUrl: string) => {
    // Replace size parameter with 'original' for full resolution
    // URL format: https://image.tmdb.org/t/p/w500/poster.jpg
    // Target: https://image.tmdb.org/t/p/original/poster.jpg
    return posterUrl.replace(/\/w\d+\//, "/original/");
  };

  const handlePosterClick = () => {
    if (poster_img) {
      const fullResUrl = getFullResPosterUrl(poster_img);
      window.open(fullResUrl, "_blank");
    }
  };

  return (
    <div className={styles.titleDetailsContainer}>
      <img
        src={poster_img || posterPlaceholder}
        alt={title}
        className={styles.posterImage}
        onClick={poster_img ? handlePosterClick : undefined}
        style={{ cursor: poster_img ? "pointer" : "default" }}
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
        {renderActors()}
      </div>
    </div>
  );
};

export default TitleDetailsCard;
