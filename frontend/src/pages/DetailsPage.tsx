import React from 'react';
import { Helmet } from 'react-helmet';
import DetailsCard from '../components/DetailsCard';
import RatingsDetails from '../components/RatingsDetails';
import Button from '../components/Button';

const DetailsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Movie or TV Title goes here | ReelRatings</title>
      </Helmet>
      <DetailsCard />
      <RatingsDetails />
      <Button />
    </>
  );
};

export default DetailsPage;