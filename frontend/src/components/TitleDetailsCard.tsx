import React from 'react';

const DetailsCard: React.FC = ({ details }) => { 
  return (
    <div className="title-details-container">
  <img src="{{ details.poster_img }}" alt="{{ details.title }}" className="poster-image">
  {% if media_type == 'Movie' %}
  <div className="title-details-wrapper">
    <h3>{{ details.title }}</h3>
    {% if details.certifcation and details.runtime %}
    <div><span className='certification'>{{ details.certifcation }}</span>{{ details.year }} • {{ details.runtime }}</div>
    <div>Director: {{ details.director[0] }}{% if details.director[1] %}<span>, {{ details.director[1]}}</span>{% endif
      %}</div>
    {% elif details.runtime and not details.certification %}
    <div>{{ details.year }} • {{ details.runtime }}</div>
    <div>Director: {{ details.director[0] }}{% if details.director[1] %}<span>, {{ details.director[1]}}</span>{% endif
      %}</div>
    {% else %}
    <div>{{ details.year }}</div>
    <div>Director: {{ details.director[0] }}{% if details.director[1] %}<span>, {{ details.director[1]}}</span>{% endif
      %}</div>
    {% endif %}
    {% if commonsense_info %}
    <a href="{{ commonsense_info['url'] }}" target="_blank" rel="noopener noreferrer">
      <div className="commonsense-wrapper">
        <img src="/static/img/logo-checkmark-green.svg" className="commonsense-icon">
        <div>
          {{ commonsense_info['rating'] }}
        </div>
      </div>
    </a>
    {% endif %}
  </div>
  {% elif media_type == 'TV' %}
  <div className="title-details-wrapper">
    <h3>{{ details.title }}</h3>
    <p>{{ details.year }}</p>
    {% if details.creator %}
    <p>Creator: {{ details.creator[0] }}{% if details.creator[1] %}<span>, {{ details.creator[1]}}</span>{% endif %}</p>
    {% endif %}
    {% if commonsense_info %}
    <a href="{{ commonsense_info['url'] }}" target="_blank" rel="noopener noreferrer">
      <div className="commonsense-wrapper">
        <img src="/static/img/logo-checkmark-green.svg" className="commonsense-icon">
        <div>
          {{ commonsense_info['rating'] }}
        </div>
      </div>
    </a>
    {% endif %}
  </div>
  {% endif %}
</div>
  );
};

export default DetailsCard;