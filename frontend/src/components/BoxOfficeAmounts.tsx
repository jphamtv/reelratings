import React from 'react';

interface BoxOfficeAmountsProps {
  boxOfficeMojoUrl: string;
  amounts: string[];
}

const BoxOfficeAmounts: React.FC<BoxOfficeAmountsProps> = ({ boxOfficeMojoUrl, amounts }) => {
  if (amounts[2] === '–') return null;

  return (
    <div className="box-office-container">
      <a href={boxOfficeMojoUrl} target="_blank" rel="noopener noreferrer">
        <div className="box-office-wrapper card">
          {amounts[0] !== '–' && (
            <div>
              <p className="box-office-rating">{amounts[0]}</p>
              <p className="label-box-office">Domestic</p>
            </div>
          )}
          {amounts[1] !== '–' && (
            <div>
              <p className="box-office-rating">{amounts[1]}</p>
              <p className="label-box-office">International</p>
            </div>
          )}
          {amounts[0] !== '–' && amounts[1] !== '–' && (
            <div>
              <p className="box-office-rating">{amounts[2]}</p>
              <p className="label-box-office">Worldwide</p>
            </div>
          )}
        </div>
      </a>
    </div>
  );
}

export default BoxOfficeAmounts;