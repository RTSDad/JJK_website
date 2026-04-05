import React from 'react';

const PlaygroundCanvas = ({ localPlayer, players }) => {
  return (
    <div className="playground-arena">
      {/* Render Remote Players */}
      {players.map(p => (
         <div key={p.id} className="player-avatar remote" style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
            <span className="player-name">{p.username}</span>
            <img src={p.avatar} alt={p.username} draggable={false} />
         </div>
      ))}

      {/* Render Local Player */}
      <div className="player-avatar local" style={{ transform: `translate(${localPlayer.x}px, ${localPlayer.y}px)` }}>
          <span className="player-name">{localPlayer.username} (You)</span>
          <img src={localPlayer.avatar} alt="Me" draggable={false} />
      </div>
    </div>
  );
};

export default PlaygroundCanvas;
