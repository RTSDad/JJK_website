import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { characters } from '../data/characters';
import PlaygroundCanvas from '../components/PlaygroundCanvas';
import './Playground.css';

const generateUUID = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
const generateGuestName = () => `GuestUser_${Math.floor(Math.random() * 9999)}`;

const Playground = () => {
  const [localUserId] = useState(generateUUID());
  const [localUser, setLocalUser] = useState({
    id: localUserId,
    username: generateGuestName(),
    avatar: characters[0].image,
    x: 400,
    y: 300
  });
  
  const [players, setPlayers] = useState({});
  const channelRef = useRef(null);
  
  const positionRef = useRef({ x: localUser.x, y: localUser.y });
  const keysRef = useRef({});
  const lastUpdateRef = useRef(0);
  
  // Separate mutable strings from the position loop dependencies
  const configRef = useRef({ username: localUser.username, avatar: localUser.avatar });

  useEffect(() => {
     configRef.current = { username: localUser.username, avatar: localUser.avatar };
     broadcastPosition(positionRef.current.x, positionRef.current.y);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localUser.username, localUser.avatar]);

  const broadcastPosition = async (x, y) => {
    if (channelRef.current && channelRef.current.state === 'joined') {
      try {
        await channelRef.current.track({
          id: localUserId,
          username: configRef.current.username,
          avatar: configRef.current.avatar,
          x,
          y
        });
      } catch (e) {
        console.error("Tracking error:", e);
      }
    }
  };

  useEffect(() => {
    // 1. Join Supabase Channel
    const channel = supabase.channel('playground', {
      config: {
        presence: {
          key: localUserId,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const statePlayers = {};
        for (const [key, presences] of Object.entries(state)) {
           // presences is an array
           if (presences.length > 0 && key !== localUserId) {
             statePlayers[key] = presences[0];
           }
        }
        setPlayers(statePlayers);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
         setPlayers(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
         });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Send initial tracking hit upon subscription
          broadcastPosition(positionRef.current.x, positionRef.current.y);
        }
      });

    // 2. Setup Key Listeners
    const handleKeyDown = (e) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e) => { keysRef.current[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 3. Game / Movement Loop
    let animationFrameId;
    const speed = 5;
    
    const gameLoop = () => {
      let moved = false;
      const pos = positionRef.current;
      
      // Assume 800x600 arena
      if (keysRef.current['w'] || keysRef.current['ArrowUp']) { pos.y -= speed; moved = true; }
      if (keysRef.current['s'] || keysRef.current['ArrowDown']) { pos.y += speed; moved = true; }
      if (keysRef.current['a'] || keysRef.current['ArrowLeft']) { pos.x -= speed; moved = true; }
      if (keysRef.current['d'] || keysRef.current['ArrowRight']) { pos.x += speed; moved = true; }
      
      if (moved) {
        // Clamp boundaries (arena is 800x600, avatar is 50x50)
        pos.x = Math.max(0, Math.min(800 - 50, pos.x));
        pos.y = Math.max(0, Math.min(600 - 50, pos.y));
        
        // Optimistic UI updates
        setLocalUser(prev => ({ ...prev, x: pos.x, y: pos.y }));
        
        // Network throttling (100ms)
        const now = Date.now();
        if (now - lastUpdateRef.current >= 100) {
           broadcastPosition(pos.x, pos.y);
           lastUpdateRef.current = now;
        }
      }
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localUserId]);

  const handleAvatarChange = (e) => {
     setLocalUser(prev => ({ ...prev, avatar: e.target.value }));
  };
  
  const handleUsernameChange = (e) => {
     setLocalUser(prev => ({ ...prev, username: e.target.value }));
  };

  return (
    <div className="playground-container">
       <div className="playground-header">
         <div>
            <Link to="/" className="back-link btn" style={{marginBottom: '10px', display: 'inline-block'}}>← Back to Ranking</Link>
            <h2>JJK Realtime Playground</h2>
         </div>
         <div className="controls">
            <input 
              type="text" 
              value={localUser.username} 
              onChange={handleUsernameChange} 
              maxLength={15} 
            />
            <select value={localUser.avatar} onChange={handleAvatarChange}>
               {characters.map(c => (
                  <option key={c.id} value={c.image}>{c.name}</option>
               ))}
            </select>
         </div>
       </div>
       <PlaygroundCanvas localPlayer={localUser} players={Object.values(players)} />
       <div className="instructions" style={{marginTop: '20px', color: '#999'}}>
          Use <strong>W, A, S, D</strong> or <strong>Arrow Keys</strong> to move. Open this page in a second browser window to see real-time updates!
       </div>
    </div>
  );
};

export default Playground;
