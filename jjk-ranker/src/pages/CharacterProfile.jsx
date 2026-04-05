import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CharacterProfile.css';

const CharacterProfile = ({ characters, votedCharacterId, onUpvote }) => {
  const { id } = useParams();
  const character = characters.find(c => c.id === parseInt(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!character) {
    return (
      <div className="profile-container profile-not-found">
        <h2>Character Not Found</h2>
        <Link to="/" className="back-link">Return to Ranks</Link>
      </div>
    );
  }

  const isActiveVote = votedCharacterId === character.id;
  const currentVotes = isActiveVote ? character.votes + 1 : character.votes;

  // Split narrative into paragraphs
  const paragraphs = character.narrative.split('\n\n');

  return (
    <div className="profile-container">
      <nav className="profile-nav">
        <Link to="/" className="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Ranks
        </Link>
      </nav>

      <header className="profile-header">
        <div className="profile-header-content">
          <h1 className="profile-title">{character.name}</h1>
          <p className="profile-subtitle">{character.description}</p>
          
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-value">{currentVotes}</span>
              <span className="stat-label">Power Level</span>
            </div>
            <button 
              className={`profile-upvote-button ${isActiveVote ? 'voted' : ''}`}
              onClick={(e) => onUpvote(character.id, e)}
            >
              {isActiveVote ? 'Power Assigned' : 'Transfer Power Vote'}
            </button>
          </div>
        </div>
      </header>

      <main className="profile-main">
        <section className="profile-narrative">
          <h2>Origins & Lore</h2>
          <div className="narrative-content">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <section className="profile-gallery-section">
          <h2>Archives</h2>
          <div className="profile-gallery">
            {character.gallery.map((img, i) => (
              <div key={i} className="gallery-image-wrapper">
                <img src={img} alt={`${character.name} archive ${i + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default CharacterProfile;
