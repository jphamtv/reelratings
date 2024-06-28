import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import SearchBar from './SearchBar';
import Footer from './Footer';

const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="search-container">
        <SearchBar className=''/>
      </div>
      <main><Outlet /></main>
      <Footer />
    </div>
  );
};

export default Layout;