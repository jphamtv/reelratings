import React from 'react';
import { Link } from 'react-router-dom';
import reelRatingsLogo from '../assets/img/reelratings_logo_yellow.svg';

const Header: React.FC = () => {
  return (
    <header>
      <Link to='/'>
        <img src={reelRatingsLogo} className="logo" alt="ReelRatings" />
      </Link>
    </header>
  );
};

export default Header;