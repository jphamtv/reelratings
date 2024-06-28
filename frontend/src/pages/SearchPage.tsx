import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import SearchResultItem from '../components/SearchResultItem';

const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState([]);


  // <script>
  //   document.addEventListener("DOMContentLoaded", function () {
  //     const clickableResults = document.querySelectorAll('.search-result-item-link');

  //     clickableResults.forEach(function (element) {
  //       element.addEventListener('click', function () {
  //         // Set the session storage item to indicate loading state
  //         sessionStorage.setItem('displayState', 'loading');
          
  //         // Hide results and show loading animation
  //         document.getElementById("results").style.display = "none";
  //         document.getElementById("loading").style.display = "block";
  //       });
  //     });
  //   });

  //   window.addEventListener('pageshow', function(event) {
  //     const displayState = sessionStorage.getItem('displayState');
      
  //     if (displayState === 'loading') {
  //       // Show results and hide loading animation
  //       document.getElementById("results").style.display = "block";
  //       document.getElementById("loading").style.display = "none";
        
  //       // Clear the stored state
  //       sessionStorage.removeItem('displayState');
  //     }
  //   });
  // </script>

  const Error = () => { 
    return (
      <p className="error-message">Bummer, no matches for that title. Check the spelling and try again.</p>
    );
  };

  return (
      <>
        <Helmet>
          <title>Search Results | ReelRatings</title>
        </Helmet>
        <Layout>
          <SearchBar className='search-container' />
          <div className='search-list-container'>
          {searchResults && 
            }
          </div>
        </Layout>
      </>
  );
};

export default SearchPage;