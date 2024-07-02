import React from 'react';
import { Link } from 'react-router-dom';
import logoYellow from '../assets/img/logo_yellow.svg';

const Header: React.FC = () => {
  return (
    <header>
      <Link to='/'>
        <img src={logoYellow} className="logo" alt="ReelRatings" />
      </Link>
    </header>
  );
};

export default Header;