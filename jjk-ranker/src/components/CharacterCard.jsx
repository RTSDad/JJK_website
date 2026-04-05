import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CharacterCard.css';

const CharacterCard = ({ character, onUpvote, isActiveVote }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to character specific detail page
    navigate(`/character/${character.id}`);
  };

  return (
    <div className={`character-card ${isActiveVote ? 'active-vote' : ''}`} onClick={handleCardClick} role="button" tabIndex={0}>
      <div className="card-image-container">
        <img src={character.image} alt={character.name} className="card-image" loading="lazy" />
      </div>
      <div className="card-overlay">
        <div className="card-content">
          <h2 className="character-name">{character.name}</h2>
          
          <div className="character-description-container">
            <p className="character-description">
              {character.description}
            </p>
          </div>

          <div className="card-actions">
            <div className="vote-count-container">
              <span className={`vote-count ${isActiveVote ? 'pulse-text' : ''}`}>{character.votes}</span>
              <span className="vote-label">Power Level</span>
            </div>
            
            <button 
              className={`upvote-button ${isActiveVote ? 'voted' : ''}`} 
              onClick={(e) => onUpvote(character.id, e)}
              aria-label={`Upvote ${character.name}`}
            >
              <svg className="upvote-icon" viewBox="0 0 24 24">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              {isActiveVote ? 'Leveled Up!' : 'Level Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
