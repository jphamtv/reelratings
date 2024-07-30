import { Link } from "react-router-dom";
import reelRatingsLogo from "../assets/img/reelratings_logo_yellow.svg";
import styles from "./Header.module.css";

interface HeaderProps {
  onLogoClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className={styles.header}>
      <Link to="/" onClick={onLogoClick}>
        <img src={reelRatingsLogo} className={styles.logo} alt="ReelRatings" />
      </Link>
    </header>
  );
};

export default Header;
