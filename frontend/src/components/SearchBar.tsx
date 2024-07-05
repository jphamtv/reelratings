import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  className = 'searchContainer',
  placeholder = 'Search Movies & TV'
}) => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchValue.trim())}`);
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
            <button type="button" className={styles.clearButton} onClick={handleClear}>
              &times;
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;