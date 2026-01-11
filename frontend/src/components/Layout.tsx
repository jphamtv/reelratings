import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import SearchBar from "./SearchBar";
import Footer from "./Footer";
import LetterboxdModal from "./LetterboxdModal";
import { useSearch } from "../hooks/useSearch";
import { useTheme } from "../hooks/useTheme";
import styles from "./Layout.module.css";

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSearchValue } = useSearch();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Clear search value when not on SearchPage
    if (!location.pathname.startsWith("/search")) {
      setSearchValue("");
    }
  }, [location.pathname, setSearchValue]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setSearchValue("");
    navigate("/");
  };

  const handleLetterboxdClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <Header onLogoClick={handleLogoClick} />
      <SearchBar
        className={`${styles.searchContainer} ${theme === "dark" ? styles.darkTheme : ""}`}
      />
      <main>
        <Outlet />
      </main>
      <Footer onLetterboxdClick={handleLetterboxdClick} />
      <LetterboxdModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
};

export default Layout;
