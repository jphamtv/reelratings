import React from 'react';
import styles from './BoxOfficeAmounts.module.css';
import sharedStyles from '../assets/css/sharedStyles.module.css';

interface BoxOfficeAmountsProps {
  boxOfficeMojoUrl: string;
  amounts: string[];
}

const BoxOfficeAmounts: React.FC<BoxOfficeAmountsProps> = ({ boxOfficeMojoUrl, amounts }) => {
  if (amounts[2] === '–') return null;

  return (
    <div className={styles.boxOfficeContainer}>
      <a href={boxOfficeMojoUrl} target="_blank" rel="noopener noreferrer">
        <div className={`${styles.boxOfficeWrapper} ${sharedStyles.card}`}>
          {amounts[0] !== '–' && (
            <div>
              <p className={styles.boxOfficeRating}>{amounts[0]}</p>
              <p className={styles.boxOfficeLabel}>Domestic</p>
            </div>
          )}
          {amounts[1] !== '–' && (
            <div>
              <p className={styles.boxOfficeRating}>{amounts[1]}</p>
              <p className={styles.boxOfficeLabel}>International</p>
            </div>
          )}
          {amounts[0] !== '–' && amounts[1] !== '–' && (
            <div>
              <p className={styles.boxOfficeRating}>{amounts[2]}</p>
              <p className={styles.boxOfficeLabel}>Worldwide</p>
            </div>
          )}
        </div>
      </a>
    </div>
  );
}

export default BoxOfficeAmounts;