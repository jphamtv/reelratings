import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getTitleDetails } from '../services/api';
import TitleDetailsCard from '../components/TitleDetailsCard';
import RatingsDetails from '../components/RatingsDetails';
import BoxOfficeAmounts from '../components/BoxOfficeAmounts';
import Button from '../components/Button';
import errorImage from '../assets/img/error_500.png';
import styles from './DetailsPage.module.css';

interface TitleDetails {
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
    imdb_url: string;
    imdb_rating: string | null;
    rottentomatoes_url: string;
    rottentomatoes_scores: {
      tomatometer: string | null;
      tomatometer_state: string | null;
      audience_score: string | null;
      audience_state: string | null;
    };
    letterboxd_url?: string | null;
    letterboxd_rating?: string | null;
    commonsense_info?: {
      url: string;
      rating: string;
    } | null;
    boxofficemojo_url?: string;
    box_office_amounts?: string[] | null;
    justwatch_page: string | null;
  };
}

const DetailsPage: React.FC = () => {
  const [details, setDetails] = useState<TitleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { tmdbId, mediaType } = useParams<{ tmdbId: string; mediaType: string }>();

  const fetchDetails = useCallback(async () => {
    if (!tmdbId || !mediaType) return;

    try {
      setLoading(true);
      setError(false);
      const data = await getTitleDetails(tmdbId, mediaType);
      console.log('Data:', data)
      setDetails(data);
    } catch (err) {
      console.error("Error fetching details:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [tmdbId, mediaType]);

  useEffect(() => {
    fetchDetails();
   }, [fetchDetails]);

  if (loading) {
    return (
      <div>
        <div className={styles.emptyStateContainer}>
          <div className={styles.poster}></div>
          <div className={styles.emptyStateWrapper}>
            <div className={styles.info}></div>
            <div className={styles.info}></div>
            <div className={styles.info}></div>
          </div>
        </div>
        <div className={styles.card}></div>
        <div className={styles.card}></div>
        <div className={styles.card}></div>
      </div>
    ); 
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <img src={errorImage} className={styles.errorImage} alt='Error occured'/>
        <button onClick={fetchDetails} className={styles.retryButton}>
          Try fetching again?
        </button>
      </div>
    ); 
  }

  const defaultTmdbData: TitleDetails['tmdb_data'] = {
    imdb_id: '',
    media_type: 'Movie',
    title: '',
    year: '',
    poster_img: '',
    justwatch_url: '',
    director: [],
    runtime: '',
    certification: '',
    creator: []
  };

  const defaultExternalData: TitleDetails['external_data'] = {
    imdb_url: '',
    imdb_rating: null,
    rottentomatoes_url: '',
    rottentomatoes_scores: {
      tomatometer: null,
      tomatometer_state: null,
      audience_score: null,
      audience_state: null
    },
    justwatch_page: '',
    letterboxd_url: '',
    letterboxd_rating: null,
    commonsense_info: undefined,
    boxofficemojo_url: '',
    box_office_amounts: []
  };

  const tmdb_data = details?.tmdb_data ?? defaultTmdbData;
  const external_data = details?.external_data ?? defaultExternalData;

  return (
    <>
      <Helmet>
        <title>{`${tmdb_data.title} (${tmdb_data.year}) | ReelRatings`}</title>
      </Helmet>
      <TitleDetailsCard
        tmdbData={tmdb_data}
        commonsenseData={external_data.commonsense_info ?? undefined}
      />
      <RatingsDetails
        imdbData={external_data.imdb_url
          ? {
            url: external_data.imdb_url,
            rating: external_data.imdb_rating ?? null
          }
          : undefined
        }
        rottenTomatoesData={external_data.rottentomatoes_url
          ? {
            url: external_data.rottentomatoes_url,
            scores: external_data.rottentomatoes_scores ?? {
              tomatometer: null,
              tomatometer_state: null,
              audience_score: null,
              audience_state: null
            }
            }
          : undefined
        }
        letterboxdData={external_data.letterboxd_url
          ? {
            url: external_data.letterboxd_url,
            rating: external_data.letterboxd_rating ?? null
            }
          : undefined
        }
      />
      {tmdb_data.media_type === 'Movie' && external_data.box_office_amounts && (
        <BoxOfficeAmounts
          boxOfficeMojoUrl={external_data.boxofficemojo_url}
          amounts={external_data.box_office_amounts}
        />
      )}
      <Button
        justWatchUrl={tmdb_data.justwatch_url}
        justWatchPage={external_data.justwatch_page ?? undefined}
      />
    </>
  );
};

export default DetailsPage;
