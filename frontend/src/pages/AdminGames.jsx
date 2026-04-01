import { useEffect, useState } from 'react';
import { api } from '../api';

export default function AdminGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = () => {
    setLoading(true);
    api.admin.listGames()
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleUpdate = (gameId, data) => {
    api.admin.updateGame(gameId, data)
      .then(() => {
        fetchGames();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="admin-container">
      <header className="page-header">
        <h1>Game Management</h1>
        <p>View and manage all board games available.</p>
      </header>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Players</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id}>
                <td>{game.id}</td>
                <td>{game.name}</td>
                <td>{game.slug}</td>
                <td>{game.min_players}-{game.max_players}</td>
                <td>{game.difficulty}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-compact"
                    onClick={() => {
                        const name = prompt('Change game name:', game.name);
                        if (name) handleUpdate(game.id, { name });
                    }}
                  >
                    Edit Name
                  </button>
                  <button
                    className="btn btn-secondary btn-compact"
                    onClick={() => {
                        const description = prompt('Change game description:', game.description);
                        if (description) handleUpdate(game.id, { description });
                    }}
                  >
                    Edit Description
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
