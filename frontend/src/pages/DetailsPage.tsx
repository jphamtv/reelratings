import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { getTitleDetails } from '../services/api';
// import TitleDetailsCard from '../components/TitleDetailsCard';
// import RatingsDetails from '../components/RatingsDetails';
// import BoxOfficeAmounts from '../components/BoxOfficeAmounts';
// import Button from '../components/Button';
import errorImage from '../assets/img/500_error.png';


const DetailsPage: React.FC = () => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tmdbId, mediaType } = useParams<{ tmdbId: string; mediaType: string }>();

  useEffect(() => {
    if (tmdbId && mediaType) {
      fetchTitleDetails(tmdbId, mediaType);
    }
  }, [tmdbId, mediaType]);

  const fetchTitleDetails = async (id: string, type: string) => {
    try {
      setLoading(true);
      const detailsData = await getTitleDetails(id, type);
      setDetails(detailsData);
    } catch (err) {
      setError('Failed to fetch title details');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <>
      <Helmet>
        <title>Movie or TV Title goes here | ReelRatings</title>
      </Helmet>
      <TitleDetailsCard details={details} />
      <RatingsDetails details={details} />
      <BoxOfficeAmounts details={details} />
      <Button />
    </>
  );
};

export default DetailsPage;
