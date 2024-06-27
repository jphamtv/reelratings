import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header>
      <Link to='/'>
        <img src="/img/logo_yellow_v2.svg" className="logo" alt="ReelRatingsDB" />
      </Link>
    </header>
  );
};

export default Header;