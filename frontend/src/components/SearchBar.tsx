import { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";
import { useTheme } from "../hooks/useTheme";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  forceDarkTheme?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  className = "searchContainer",
  placeholder = "Search Movies & TV Shows",
  forceDarkTheme = false,
}) => {
  const { searchValue, setSearchValue, setSubmittedQuery } = useSearch();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const isDarkTheme = forceDarkTheme || theme === "dark";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query");
    if (query) {
      setSearchValue(query);
      setSubmittedQuery(query);
    }
  }, [location.search, setSearchValue, setSubmittedQuery]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSubmittedQuery(searchValue.trim());
      // Add a timestampe to force a new search
      const timestamp = Date.now();
      navigate(
        `/search?query=${encodeURIComponent(searchValue.trim())}&t=${timestamp}`,
      );
    }
  };

  const handleClear = () => {
    setSearchValue("");
    inputRef.current?.focus();
  };

  const handleSearchIconClick = () => {
    if (searchValue.trim()) {
      setSubmittedQuery(searchValue.trim());
      const timestamp = Date.now();
      navigate(
        `/search?query=${encodeURIComponent(searchValue.trim())}&t=${timestamp}`,
      );
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit}>
        <div className={styles.searchWrapper}>
          <button
            type="button"
            className={styles.searchIcon}
            onClick={handleSearchIconClick}
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={placeholder}
            className={`${styles.searchField} ${isDarkTheme ? styles.darkTheme : ""}`}
            required
          />
          {searchValue && (
            <button
              type="button"
              className={`${styles.clearButton} ${isDarkTheme ? styles.darkTheme : ""}`}
              onClick={handleClear}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
