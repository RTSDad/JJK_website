import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import CharacterCard from './components/CharacterCard';
import CharacterProfile from './pages/CharacterProfile';
import { characters as initialCharacters } from './data/characters';

function App() {
  const [characters, setCharacters] = useState([]);
  const [votedCharacterId, setVotedCharacterId] = useState(null);

  useEffect(() => {
    // Generate dynamic vote counts
    const updatedChars = initialCharacters.map(char => ({
      ...char,
      votes: char.id === votedCharacterId ? char.votes + 1 : char.votes
    }));
    
    // Auto-sort
    const sorted = updatedChars.sort((a, b) => b.votes - a.votes);
    setCharacters(sorted);
  }, [votedCharacterId]);

  const handleUpvote = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (votedCharacterId === id) {
      setVotedCharacterId(null); // Toggle off if clicked again
    } else {
      setVotedCharacterId(id); // Assign the single vote
    }
  };

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={
           <>
              <header className="app-header">
                <h1 className="app-title">Jujutsu Kaisen</h1>
                <p className="app-subtitle">
                  Rank the strongest sorcerers and curses. You have exactly <strong>1 Level Up Vote</strong>. 
                  Transfer it wisely. Click on a character to read their full profile.
                </p>
              </header>

              <main className="characters-grid">
                {characters.map(char => (
                  <CharacterCard 
                    key={char.id} 
                    character={char} 
                    onUpvote={handleUpvote} 
                    isActiveVote={votedCharacterId === char.id}
                  />
                ))}
              </main>
           </>
        } />
        <Route path="/character/:id" element={<CharacterProfile characters={characters} votedCharacterId={votedCharacterId} onUpvote={handleUpvote} />} />
      </Routes>
    </div>
  );
}

export default App;
