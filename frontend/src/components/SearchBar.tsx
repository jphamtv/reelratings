import { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  className = 'searchContainer',
  placeholder = 'Search Movies & TV'
}) => {
  const { searchValue, setSearchValue } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    if (query) {
      setSearchValue(query);
    }
   }, [location.search, setSearchValue]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Add a timestampe to force a new search
      const timestamp = Date.now();
      navigate(`/search?query=${encodeURIComponent(searchValue.trim())}&t=${timestamp}`);
    }
  };

  const handleClear = () => {
    setSearchValue('');
    inputRef.current?.focus();
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit}>
        <div className={styles.searchWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={placeholder}
            className={styles.searchField}
            required
          />
          {searchValue && (
            <button
              type="button"
              className={styles.clearButton}
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