import React, { useState, useEffect } from 'react';

const GamePage = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(console.error);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Danh sách các trò chơi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => (
          <div key={game.id} className="border p-5 rounded-lg shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-2">{game.name}</h2>
            <p className="text-gray-600 mb-4">{game.description}</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Chơi ngay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamePage;
