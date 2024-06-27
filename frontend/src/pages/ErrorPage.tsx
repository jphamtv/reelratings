import React from 'react';

const ErrorPage: React.FC = () => { 
  return (
    <div className="error-container">
      <img src="/static/img/500_error.png" className="error-image" />
    </div>
  );
};

export default ErrorPage;