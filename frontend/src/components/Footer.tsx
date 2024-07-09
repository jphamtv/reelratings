import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer>
      <div className={styles.footer}>
        <p className={styles.copyright}>© 2024 ReelRatings</p>
      </div>
    </footer>
  );
};

export default Footer;