import React from 'react';

const Button: React.FC () => { 
  return (
    <div className="button-container">
      {% if details.justwatch_url %}
      {% if justwatch_page %}
      <a href="{{ justwatch_page }}" target="_blank" rel="noopener noreferrer">
        <div className="justwatch-button">
          <img src="/static/img/justwatch-small-black.svg" className="justwatch-icon">
          <span>Where to Rent or Stream</span>
        </div>
      </a>
      {% else %}
      <a href="{{ details.justwatch_url }}" target="_blank" rel="noopener noreferrer">
        <div className="justwatch-button">
          <img src="/static/img/justwatch-small-black.svg" className="justwatch-icon">
          <span>Where to Rent or Stream</span>
        </div>
      </a>
      {% endif %}
      {% endif %}
      <a href="javascript:history.back()">
        <div className="button">
          <span>Back to Results</span>
        </div>
      </a>
    </div>
  );
};