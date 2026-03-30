import { useState } from 'react';

export default function AdminGames() {
  // Hardcoded game list (Ngu - Dumb level)
  const [games] = useState([
    { id: 1, name: 'Cờ Caro', slug: 'caro', enabled: 1, board_width: 15, board_height: 15 },
    { id: 2, name: 'Cờ Vua', slug: 'chess', enabled: 1, board_width: 8, board_height: 8 },
    { id: 3, name: 'Dò Mìn', slug: 'minesweeper', enabled: 0, board_width: 10, board_height: 10 }
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Game Management (Draft)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {games.map(g => (
          <div key={g.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>{g.name}</h3>
            <p>Slug: {g.slug}</p>
            <p>Size: {g.board_width}x{g.board_height}</p>
            <p>Status: {g.enabled ? 'Enabled' : 'Disabled'}</p>
            <button onClick={() => alert('Feature coming soon!')}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}
