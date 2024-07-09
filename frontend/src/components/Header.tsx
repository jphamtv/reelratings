import { Link } from 'react-router-dom';
import reelRatingsLogo from '../assets/img/reelratings_logo_yellow.svg';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <Link to='/'>
        <img src={reelRatingsLogo} className={styles.logo} alt="ReelRatings" />
      </Link>
    </header>
  );
};

export default Header;