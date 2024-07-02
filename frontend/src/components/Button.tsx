import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ButtonProps {
  justwatchUrl: string;
  justwatchPage?: string;
}

const Button: React.FC<ButtonProps> = ({ justwatchUrl, justwatchPage }) => {
  const navigate = useNavigate();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div className="button-container">
      {justwatchUrl && (
        <a href={justwatchPage || justwatchUrl} target="_blank" rel="noopener noreferrer">
          <div className="justwatch-button">
            <img src="/static/img/justwatch-small-black.svg" className="justwatch-icon" alt="JustWatch" />
            <span>Where to Rent or Stream</span>
          </div>
        </a>
      )}
      <a href="#" onClick={handleBack}>
        <div className="button">
          <span>Back to Results</span>
        </div>
      </a>
    </div>
  );
};

export default Button;
