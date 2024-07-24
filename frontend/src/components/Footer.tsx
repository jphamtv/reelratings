import { useTheme } from '../hooks/useTheme';
import lightModeIcon from '../assets/img/light_mode.svg';
import darkModeIcon from '../assets/img/dark_mode.svg';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const themeIcon = theme === 'light' ? darkModeIcon : lightModeIcon;
  return (
    <footer>
      <div className={styles.footerContainer}>
        <p className={styles.copyright}>© 2024 ReelRatings</p>
        <button onClick={toggleTheme} className={styles.toggleButton}>
          <img src={themeIcon} className={styles.themeIcon} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;