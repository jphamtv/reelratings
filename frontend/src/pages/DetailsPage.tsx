import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getTitleDetails } from '../services/api';
import TitleDetailsCard from '../components/TitleDetailsCard';
import RatingsDetails from '../components/RatingsDetails';
import BoxOfficeAmounts from '../components/BoxOfficeAmounts';
import Button from '../components/Button';
import errorImage from '../assets/img/500_error.png';

interface TitleDetails {
  tmdb_data: {
    imdb_id: string;
    media_type: "Movie" | "TV";
    title: string;
    poster_img: string;
    justwatch_url: string;
    director?: string[];
    runtime?: string;
    certification?: string;
    creator?: string[];
  };
  external_data: {
    imdb_url: string;
    imdb_ratings: string;
    rottentomatoes_url: string;
    rottentomatoes_scores: {
      tomatometer: string;
      tomatometer_state: string;
      audience_score: string;
      audience_state: string;
    };
    letterboxd_url?: string;
    letterboxd_rating?: string;
    commonsense_info?: {
      url: string;
      rating: string;
    };
    boxofficemojo_url?: string;
    box_office_amounts?: string[];
    justwatch_page: string;
  };
}


const DetailsPage: React.FC = () => {
  const [details, setDetails] = useState<TitleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tmdbId, mediaType } = useParams<{ tmdbId: string; mediaType: string }>();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!tmdbId || !mediaType) return;

      try {
        setLoading(true);
        const data = await getTitleDetails(tmdbId, mediaType);
        console.log('Details Data:', data);
        setDetails(data);
      } catch (err) {
        console.error('Details error:', err);
        setError('Failed to fetch title details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [tmdbId, mediaType]);

    const renderLoading = () => {
    <div id="loading">
      <div className="empty-state-details-container">
        <div className="empty-state-poster"></div>
        <div className="empty-state-details-wrapper">
          <div className="empty-state-info"></div>
          <div className="empty-state-info"></div>
          <div className="empty-state-info"></div>
        </div>
      </div>
      <div className="empty-state-card">
      </div>
      <div className="empty-state-card">
      </div>
      <div className="empty-state-card">
      </div>
    </div>
  };

  const renderError = () => { 
    <div className="error-container">
      <img src={errorImage} className="error-image" />
    </div>
  };

  if (loading) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  const { tmdb_data, external_data } = details;

  return (
    <>
      <Helmet>
        <title>{`${tmdb_data.title} (${tmdb_data.year}) | ReelRatings`}</title>
      </Helmet>
      <TitleDetailsCard details={tmdb_data} />
      <RatingsDetails
        imdbData={{
          url: external_data.imdb_url, rating: external_data.imdb_rating
        }}
        rottenTomatoesData={{
          url: external_data.rottentomatoes_url,
          scores: external_data.rottentomatoes_scores
        }}
        letterboxdData={external_data.letterboxd_url && external_data.letterboxd_rating
          ? {
            url: external_data.letterboxd_url,
            rating: external_data.letterboxd_rating
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
      {external_data.justwatch_page && (
        <Button justwatchUrl={external_data.justwatch_page} />
      )}
    </>
  );
};

export default DetailsPage;
