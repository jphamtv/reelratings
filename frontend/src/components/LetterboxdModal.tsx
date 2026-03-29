import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClientCache } from "../hooks/useClientCache";
import styles from "./LetterboxdModal.module.css";

interface LetterboxdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LetterboxdModal: React.FC<LetterboxdModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const { getItem, setItem } = useClientCache();
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved username from cache
    const savedUsername = getItem<string>("letterboxd_username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, [getItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      // Save username to cache (no expiration)
      setItem("letterboxd_username", username.trim());
      // Navigate to watchlist page
      navigate(`/watchlist?username=${encodeURIComponent(username.trim())}`);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Enter Letterboxd Username</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className={styles.input}
            autoFocus
          />
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.submitButton}>
              View Watchlist
            </button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LetterboxdModal;
