import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import SearchBar from './SearchBar';
import Footer from './Footer';
import styles from './Layout.module.css'

const Layout: React.FC = () => {
  return (
    <div>
      <Header />
      <SearchBar className={styles.searchContainer}/>
      <main><Outlet /></main>
      <Footer />
    </div>
  );
};

export default Layout;