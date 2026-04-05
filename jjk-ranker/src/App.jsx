import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CharacterCard from './components/CharacterCard';
import CharacterProfile from './pages/CharacterProfile';
import Playground from './pages/Playground';
import { characters as initialCharacters } from './data/characters';
import { supabase } from './supabaseClient';

function App() {
  const [characters, setCharacters] = useState(initialCharacters);
  const [hasVotedToday, setHasVotedToday] = useState(false);
  const [votedCharacterTag, setVotedCharacterTag] = useState(null);

  useEffect(() => {
    // Check local storage for today's vote
    const today = new Date().toDateString();
    const storedVote = localStorage.getItem('jjkVoteDate');
    const storedTag = localStorage.getItem('jjkVotedTag');
    if (storedVote === today) {
      setHasVotedToday(true);
      setVotedCharacterTag(storedTag);
    } else {
      setHasVotedToday(false);
      setVotedCharacterTag(null);
    }

    // Fetch live votes globally from Supabase
    const fetchVotes = async () => {
      const { data, error } = await supabase.from('character_votes').select('*');
      if (!error && data) {
        const votesMap = {};
        data.forEach(row => {
          votesMap[row.tag] = row.votes;
        });
        
        const mergedChars = initialCharacters.map(char => ({
          ...char,
          votes: votesMap[char.tag] || 0
        }));
        
        setCharacters(mergedChars.sort((a, b) => b.votes - a.votes));
      } else {
        // Fallback to local hardcoded votes if DB error
        setCharacters([...initialCharacters].sort((a, b) => b.votes - a.votes));
      }
    };

    fetchVotes();
  }, []);

  const handleUpvote = async (tag, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (hasVotedToday) {
      alert("You have already cast your single vote for today! Come back tomorrow.");
      return;
    }

    // Optimistic UI update (feels instantaneous to the user)
    setCharacters(prev => {
      const updated = prev.map(c => 
        c.tag === tag ? { ...c, votes: c.votes + 1 } : c
      );
      return updated.sort((a, b) => b.votes - a.votes);
    });
    
    setHasVotedToday(true);
    setVotedCharacterTag(tag);
    
    // Save locally to lock voting until tomorrow
    const today = new Date().toDateString();
    localStorage.setItem('jjkVoteDate', today);
    localStorage.setItem('jjkVotedTag', tag);

    // Update the database globally
    const { error } = await supabase.rpc('increment_vote', { character_tag_val: tag });
    if (error) {
      console.error("Error updating vote globally: ", error);
    }
  };

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={
           <>
              <header className="app-header">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <h1 className="app-title">Jujutsu Kaisen</h1>
                    <p className="app-subtitle">
                      Rank the strongest sorcerers and curses. You receive exactly <strong>1 Level Up Vote per day</strong>. 
                      {hasVotedToday ? " You have locked in your vote today." : " Choose wisely to impact the global standings."}
                    </p>
                  </div>
                  <Link to="/playground" style={{padding: '10px 20px', backgroundColor: '#e50914', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '20px'}}>
                    🎮 Realtime Playground
                  </Link>
                </div>
              </header>

              <main className="characters-grid">
                {characters.map(char => (
                  <CharacterCard 
                    key={char.id} 
                    character={char} 
                    onUpvote={handleUpvote} 
                    isActiveVote={votedCharacterTag === char.tag}
                    hasVotedToday={hasVotedToday}
                  />
                ))}
              </main>
           </>
        } />
        <Route path="/character/:id" element={<CharacterProfile characters={characters} votedCharacterTag={votedCharacterTag} hasVotedToday={hasVotedToday} onUpvote={handleUpvote} />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </div>
  );
}

export default App;
