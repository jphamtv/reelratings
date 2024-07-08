import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import SearchBar from './SearchBar';
import Footer from './Footer';
import styles from './Layout.module.css'

const Layout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);
  
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