import React from 'react';
import errorImage from '../assets/img/500_error.png';

const ErrorPage: React.FC = () => { 
  return (
    <div className="error-container">
      <img src={errorImage} className="error-image" />
    </div>
  );
};

export default ErrorPage;