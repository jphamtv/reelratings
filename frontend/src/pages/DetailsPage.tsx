import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import DetailsCard from '../components/DetailsCard';
import RatingsDetails from '../components/RatingsDetails';
import BoxOfficeAmounts from '../components/BoxOfficeAmounts';
import Button from '../components/Button';
import errorImage from '../assets/img/500_error.png';


const DetailsPage: React.FC = () => {
  const [titleDetails, setTitleDetails] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [boxOfficeAmounts, setBoxOfficeAmounts] = useState(null);
  const [detailsCardLoading, setDetailsCardLoading] = useState(true);
  const [ratingsDetailsLoading, setratingsDetailsLoading] = useState(true);
  const [error, setError] = useState(null);

  const renderDetailsCardLoading = () => {
    <div id="loading">
      <div className="empty-state-details-container">
        <div className="empty-state-poster"></div>
        <div className="empty-state-details-wrapper">
          <div className="empty-state-info"></div>
          <div className="empty-state-info"></div>
          <div className="empty-state-info"></div>
        </div>
      </div>
    </div>
  };

  const renderRatingsDetailsLoading = () => {
    <div id="loading">        
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

  if (detailsCardLoading) {
    return renderDetailsCardLoading();
  }

  if (ratingsDetailsLoading) {
    return renderRatingsDetailsLoading();
  }

  if (error) {
    return renderError();
  }

  return (
    <>
      <Helmet>
        <title>Movie or TV Title goes here | ReelRatings</title>
      </Helmet>
      <DetailsCard />
      <RatingsDetails />
      <BoxOfficeAmounts />
      <Button />
    </>
  );
};

export default DetailsPage;
