// import { useNavigate } from 'react-router-dom';
import justWatchLogo from '../assets/img/justwatch_logo.svg'
import styles from './Button.module.css';

interface ButtonProps {
  justWatchUrl: string;
  justWatchPage?: string;
}

const Button: React.FC<ButtonProps> = ({ justWatchUrl, justWatchPage }) => {
  // const navigate = useNavigate();

  // const handleBack = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   navigate(-1);
  // };

  return (
    <div className={styles.buttonContainer}>
      {justWatchUrl && (
        <a href={justWatchPage || justWatchUrl} target="_blank" rel="noopener noreferrer">
          <div className={styles.justWatchButton}>
            <img src={justWatchLogo} alt="JustWatch" />
            <span>Where to Stream</span>
          </div>
        </a>
      )}
      {/* <a href="#" onClick={handleBack}>
        <div className={styles.button}>
          <span>Back to Search Results</span>
        </div>
      </a> */}
    </div>
  );
};

export default Button;
