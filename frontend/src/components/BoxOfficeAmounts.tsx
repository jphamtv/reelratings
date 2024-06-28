import React from 'react';

const BoxOfficeAmounts: React.FC = ({ details }) => { 
  return (
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

export default BoxOfficeAmounts;