import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CharacterCard from './components/CharacterCard';
import CharacterProfile from './pages/CharacterProfile';
import Playground from './pages/Playground';
import { characters as initialCharacters } from './data/characters';
import { dragonBallCharacters as initialDbCharacters } from './data/dragonBallCharacters';
import { supabase } from './supabaseClient';

const headerLinkStyle = {
  padding: '10px 20px',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
};

const headerNavStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  marginLeft: '20px',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

function App() {
  const [characters, setCharacters] = useState(initialCharacters);
  const [hasVotedToday, setHasVotedToday] = useState(false);
  const [votedCharacterTag, setVotedCharacterTag] = useState(null);

  const [dbCharacters, setDbCharacters] = useState(initialDbCharacters);
  const [dbHasVotedToday, setDbHasVotedToday] = useState(false);
  const [dbVotedCharacterTag, setDbVotedCharacterTag] = useState(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const jjkStoredVote = localStorage.getItem('jjkVoteDate');
    const jjkStoredTag = localStorage.getItem('jjkVotedTag');
    if (jjkStoredVote === today) {
      setHasVotedToday(true);
      setVotedCharacterTag(jjkStoredTag);
    } else {
      setHasVotedToday(false);
      setVotedCharacterTag(null);
    }

    const dbStoredVote = localStorage.getItem('dbVoteDate');
    const dbStoredTag = localStorage.getItem('dbVotedTag');
    if (dbStoredVote === today) {
      setDbHasVotedToday(true);
      setDbVotedCharacterTag(dbStoredTag);
    } else {
      setDbHasVotedToday(false);
      setDbVotedCharacterTag(null);
    }

    const fetchVotes = async () => {
      const { data, error } = await supabase.from('character_votes').select('*');
      if (!error && data) {
        const votesMap = {};
        data.forEach(row => {
          votesMap[row.tag] = row.votes;
        });

        const mergedJjk = initialCharacters.map(char => ({
          ...char,
          votes: votesMap[char.tag] || 0,
        }));
        setCharacters(mergedJjk.sort((a, b) => b.votes - a.votes));

        const mergedDb = initialDbCharacters.map(char => ({
          ...char,
          votes: votesMap[char.tag] || 0,
        }));
        setDbCharacters(mergedDb.sort((a, b) => b.votes - a.votes));
      } else {
        setCharacters([...initialCharacters].sort((a, b) => b.votes - a.votes));
        setDbCharacters([...initialDbCharacters].sort((a, b) => b.votes - a.votes));
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

    setCharacters(prev => {
      const updated = prev.map(c =>
        c.tag === tag ? { ...c, votes: c.votes + 1 } : c
      );
      return updated.sort((a, b) => b.votes - a.votes);
    });

    setHasVotedToday(true);
    setVotedCharacterTag(tag);

    const today = new Date().toDateString();
    localStorage.setItem('jjkVoteDate', today);
    localStorage.setItem('jjkVotedTag', tag);

    const { error } = await supabase.rpc('increment_vote', { character_tag_val: tag });
    if (error) {
      console.error("Error updating vote globally: ", error);
    }
  };

  const handleDbUpvote = async (tag, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (dbHasVotedToday) {
      alert("You have already cast your single vote for today! Come back tomorrow.");
      return;
    }

    setDbCharacters(prev => {
      const updated = prev.map(c =>
        c.tag === tag ? { ...c, votes: c.votes + 1 } : c
      );
      return updated.sort((a, b) => b.votes - a.votes);
    });

    setDbHasVotedToday(true);
    setDbVotedCharacterTag(tag);

    const today = new Date().toDateString();
    localStorage.setItem('dbVoteDate', today);
    localStorage.setItem('dbVotedTag', tag);

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
                  <div style={headerNavStyle}>
                    <Link to="/dragon-ball" style={{ ...headerLinkStyle, backgroundColor: '#e65100' }}>
                      🐉 Dragon Ball
                    </Link>
                    <Link to="/playground" style={{ ...headerLinkStyle, backgroundColor: '#e50914' }}>
                      🎮 Realtime Playground
                    </Link>
                  </div>
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
        <Route path="/dragon-ball" element={
          <>
            <header className="app-header">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <h1 className="app-title">Dragon Ball</h1>
                  <p className="app-subtitle">
                    Rank the mightiest warriors and rivals across the multiverse. You receive exactly <strong>1 Level Up Vote per day</strong>.
                    {dbHasVotedToday ? " You have locked in your vote today." : " Choose wisely to impact the global standings."}
                  </p>
                </div>
                <div style={headerNavStyle}>
                  <Link to="/" style={{ ...headerLinkStyle, backgroundColor: '#1a1a2e' }}>
                    ← JJK Rankings
                  </Link>
                  <Link to="/playground" style={{ ...headerLinkStyle, backgroundColor: '#e50914' }}>
                    🎮 Realtime Playground
                  </Link>
                </div>
              </div>
            </header>

            <main className="characters-grid">
              {dbCharacters.map(char => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  onUpvote={handleDbUpvote}
                  isActiveVote={dbVotedCharacterTag === char.tag}
                  hasVotedToday={dbHasVotedToday}
                  getCharacterPath={(c) => `/dragon-ball/character/${c.id}`}
                />
              ))}
            </main>
          </>
        } />
        <Route path="/character/:id" element={<CharacterProfile characters={characters} votedCharacterTag={votedCharacterTag} hasVotedToday={hasVotedToday} onUpvote={handleUpvote} />} />
        <Route path="/dragon-ball/character/:id" element={<CharacterProfile characters={dbCharacters} votedCharacterTag={dbVotedCharacterTag} hasVotedToday={dbHasVotedToday} onUpvote={handleDbUpvote} rankingsPath="/dragon-ball" />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </div>
  );
}

export default App;
