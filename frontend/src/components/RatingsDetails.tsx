import React from 'react';

const RatingsDetails: React.FC = () => { 
  return (
    {% if rottentomatoes_url %}
    <a href="{{ rottentomatoes_url }}" target="_blank" rel="noopener noreferrer">
      <div class="rottentomatoes-container card">
        <div class="tomatometer-wrapper">
          <div class="rating-box-wrapper-rt">
            {% if rottentomatoes_scores.tomatometer_state == 'certified-fresh' %}
            <img src="/static/img/certified_fresh.svg" class="rating-image-rt">
            {% elif rottentomatoes_scores.tomatometer_state == 'fresh' %}
            <img src="/static/img/tomatometer-fresh.svg" class="rating-image-rt">
            {% elif rottentomatoes_scores.tomatometer_state == 'rotten' %}
            <img src="/static/img/tomatometer-rotten.svg" class="rating-image-rt">
            {% else %}
            <img src="/static/img/tomatometer-empty.svg" class="rating-image-rt">
            {% endif %}
            {% if rottentomatoes_scores.tomatometer %}
            <p class="rating">{{ rottentomatoes_scores.tomatometer }}%</p>
            {% else %}
            <p class="no_rating">--</p>
            {% endif %}
          </div>
          <p class="label">Tomatometer</p>
        </div>
        <div class="audiencescore-wrapper">
          <div class="rating-box-wrapper-rt">
            {% if rottentomatoes_scores.audience_state == 'upright' %}
            <img src="/static/img/aud_score-fresh.svg" class="rating-image-rt">
            {% elif rottentomatoes_scores.audience_state == 'spilled' %}
            <img src="/static/img/aud_score-rotten.svg" class="rating-image-rt">
            {% else %}
            <img src="/static/img/aud_score-empty.svg" class="rating-image-rt">
            {% endif %}
            {% if rottentomatoes_scores.audience_score %}
            <p class="rating">{{ rottentomatoes_scores.audience_score }}%</p>
            {% else %}
            <p class="no_rating">--</p>
            {% endif %}
          </div>
          <p class="label">Audience Score</p>
        </div>
      </div>
    </a>
    {% endif %}

    <div class="ratings-container">
      <a href="{{ imdb_url }}" target="_blank" rel="noopener noreferrer">
        <div class="imdb-wrapper card">
          <div class="rating-box-wrapper">
            {% if imdb_rating %}
            <img src="/static/img/star.svg" class="rating-image">
            <p class="rating">{{ imdb_rating }}<span class="rating-scale">/10</span></p>
            {% else %}
            <img src="/static/img/star-empty.svg" class="rating-image">
            <p class="no_rating">--</p>
            {% endif %}
          </div>
          <p class="label">IMDb</p>
        </div>
      </a>

      {% if letterboxd_url %}
      <a href="{{ letterboxd_url }}" target="_blank" rel="noopener noreferrer">
        <div class="letterbxd-wrapper card">
          <div class="rating-box-wrapper">
            {% if letterboxd_rating %}
            <img src="/static/img/star-letterboxd.svg" class="rating-image">
            <p class="rating">{{ letterboxd_rating }}<span class="rating-scale">/5</span></p>
            {% else %}
            <img src="/static/img/star-letterboxd-empty.svg" class="rating-image">
            <p class="no_rating">--</p>
            {% endif %}
          </div>
          <p class="label">Letterboxd</p>
        </div>
      </a>
      {% endif %}
    </div>

    {% if media_type == 'Movie' %}
    {% if box_office_amounts and box_office_amounts[2] != '–'%}
    <div class="box-office-container">
      <a href="{{ boxofficemojo_url }}" target="_blank" rel="noopener noreferrer">
        <div class="box-office-wrapper card">
          {% if box_office_amounts[0] != '–' %}
          <div>
            <p class="box-office-rating">{{ box_office_amounts[0] }}</p>
            <p class="label-box-office">Domestic</p>
          </div>
          {% endif %}
          {% if box_office_amounts[1] != '–' %}
          <div>
            <p class="box-office-rating">{{ box_office_amounts[1] }}</p>
            <p class="label-box-office">International</p>
          </div>
          {% endif %}
          {% if box_office_amounts[0] != '–' and box_office_amounts[1] != '–' %}
          <div>
            <p class="box-office-rating">{{ box_office_amounts[2] }}</p>
            <p class="label-box-office">Worldwide</p>
          </div>
          {% endif %}
        </div>
      </a>
    </div>
    {% endif %}
    {% endif %}
  );
};

export default RatingsDetails;