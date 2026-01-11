import { useTheme } from "../hooks/useTheme";
import lightModeIcon from "../assets/img/light_mode.svg";
import darkModeIcon from "../assets/img/dark_mode.svg";
import letterboxdIcon from "../assets/img/letterboxd_icon.svg";
import styles from "./Footer.module.css";

interface FooterProps {
  showToggle?: boolean;
  onLetterboxdClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ showToggle = true, onLetterboxdClick }) => {
  const { theme, toggleTheme } = useTheme();
  const themeIcon = theme === "light" ? darkModeIcon : lightModeIcon;
  return (
    <footer>
      <div className={styles.footerContainer}>
        <p className={styles.copyright}>© 2025 ReelRatings</p>
        {showToggle && (
          <div className={styles.buttonContainer}>
            <button onClick={onLetterboxdClick} className={styles.toggleButton}>
              <img src={letterboxdIcon} className={styles.themeIcon} alt="Letterboxd Watchlist" />
            </button>
            <button onClick={toggleTheme} className={styles.toggleButton}>
              <img src={themeIcon} className={styles.themeIcon} alt="Toggle Theme" />
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
