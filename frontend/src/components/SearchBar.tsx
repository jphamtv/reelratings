import React from 'react';

interface SearchBarProps {
  className: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className }) => { 

  return (
    <div className={className}>
      <form method="POST" action="/search">
        <div className="search-wrapper">
          <input type="text" name="title" placeholder="Search Movies & TV" className="search-field" value="{{ title }}" required />
          <button type="button" className="clear-button">&times;</button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;