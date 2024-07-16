import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import SearchBar from './SearchBar';
import Footer from './Footer';
import { useSearch } from '../hooks/useSearch';
import styles from './Layout.module.css'

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSearchValue } = useSearch();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Clear search value when not on SearchPage
    if (!location.pathname.startsWith('/search')) {
      setSearchValue('');
    }
  }, [location.pathname, setSearchValue]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setSearchValue('');
    navigate('/');
};
  
  return (
    <div>
      <Header onLogoClick={handleLogoClick} />
      <SearchBar className={styles.searchContainer}/>
      <main><Outlet /></main>
      <Footer />
    </div>
  );
};

export default Layout;