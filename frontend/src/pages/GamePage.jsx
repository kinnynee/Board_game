import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

function formatDate(value) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Chưa cập nhật';
  }

  return parsed.toLocaleDateString('vi-VN');
}

export default function GamePage() {
  const { user } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(slug || '');
  const [gameDetail, setGameDetail] = useState(null);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ratingForm, setRatingForm] = useState({ rating: 0, comment: '' });
  const [ratingSaving, setRatingSaving] = useState(false);

  useEffect(() => {
    setSelectedSlug(slug || '');
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      setLoadingGames(true);
      setError('');

      try {
        const list = await api.getGames();
        if (cancelled) return;
        setGames(list);

        if (!slug && list.length > 0) {
          navigate(`/games/${list[0].slug}`, { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoadingGames(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, [navigate, slug]);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      if (!selectedSlug) {
        setGameDetail(null);
        return;
      }

      setLoadingDetail(true);
      setError('');

      try {
        const detail = await api.getGame(selectedSlug);
        if (cancelled) return;
        setGameDetail(detail);
        setRatingForm({ rating: detail.user_rating || 0, comment: '' });
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setGameDetail(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      }
    }

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedSlug]);

  function openGame(slugValue) {
    setNotice('');
    navigate(`/games/${slugValue}`);
  }

  function updateRatingField(field) {
    return (event) => {
      const value = field === 'comment' ? event.target.value : Number(event.target.value);
      setRatingForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function submitRating(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (ratingForm.rating < 1 || ratingForm.rating > 5) {
      setError('Hãy chọn đánh giá từ 1 đến 5 sao.');
      return;
    }

    if (ratingForm.comment.length > 500) {
      setError('Bình luận nên dưới 500 ký tự.');
      return;
    }

    setRatingSaving(true);

    try {
      await api.postRating(selectedSlug, ratingForm.rating, ratingForm.comment);
      setNotice('Đánh giá đã được gửi.');
      setRatingForm({ rating: ratingForm.rating, comment: '' });
      const refreshed = await api.getGame(selectedSlug);
      setGameDetail(refreshed);
    } catch (err) {
      setError(err.message);
    } finally {
      setRatingSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="landing-card">
        <div className="panel-heading">
          <div>
            <p className="section-tag">Game & Rating</p>
            <h1>Quản lý game và đánh giá</h1>
          </div>
          <div>
            <Link className="btn btn-secondary" to="/">Quay về Home</Link>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {notice && <div className="alert alert-success">{notice}</div>}

        <div className="game-page-grid">
          <aside className="game-list-panel">
            <div className="panel-heading">
              <div>
                <p className="section-tag">Danh sách game</p>
                <h2>Game đang có</h2>
              </div>
            </div>

            {loadingGames ? (
              <div className="panel-note">Đang tải danh sách game...</div>
            ) : games.length === 0 ? (
              <div className="panel-note">Chưa có game nào để hiển thị.</div>
            ) : (
              <ul className="game-list">
                {games.map((game) => (
                  <li key={game.id}>
                    <button
                      type="button"
                      className={`game-list-item ${game.slug === selectedSlug ? 'active' : ''}`}
                      onClick={() => openGame(game.slug)}
                    >
                      <strong>{game.name}</strong>
                      <small>{game.rating_count} đánh giá · {game.average_rating ? game.average_rating.toFixed(1) : 'Chưa có'} sao</small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="game-detail-panel">
            {loadingDetail ? (
              <div className="page-loader">
                <div className="spinner" />
                <p>Đang tải chi tiết game...</p>
              </div>
            ) : !gameDetail ? (
              <div className="empty-state">
                <h2>Chọn một game</h2>
                <p>Chi tiết game và đánh giá sẽ hiển thị tại đây.</p>
              </div>
            ) : (
              <div className="page-stack">
                <article className="profile-card">
                  <div className="panel-heading">
                    <div>
                      <p className="section-tag">{gameDetail.board_size || 'Trò chơi'}</p>
                      <h2>{gameDetail.name}</h2>
                    </div>
                    <div>
                      <span className="hero-chip">{gameDetail.is_enabled ? 'Đang hiển thị' : 'Tạm dừng'}</span>
                    </div>
                  </div>

                  <div className="info-list">
                    <div>
                      <span>Mô tả</span>
                      <strong>{gameDetail.description || 'Không có mô tả.'}</strong>
                    </div>
                    <div>
                      <span>Đánh giá trung bình</span>
                      <strong>{gameDetail.average_rating ? gameDetail.average_rating.toFixed(1) : 'Chưa có'}</strong>
                    </div>
                    <div>
                      <span>Số lượt đánh giá</span>
                      <strong>{gameDetail.rating_count || 0}</strong>
                    </div>
                    <div>
                      <span>Cập nhật</span>
                      <strong>{formatDate(gameDetail.updated_at)}</strong>
                    </div>
                  </div>
                </article>

                <div className="profile-grid">
                  <article className="profile-card">
                    <div className="panel-heading">
                      <div>
                        <p className="section-tag">Bảng xếp hạng</p>
                        <h3>Top điểm cao</h3>
                      </div>
                    </div>
                    {gameDetail.top_scores?.length ? (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Người chơi</th>
                            <th>Điểm</th>
                            <th>Thời gian</th>
                            <th>Ngày</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gameDetail.top_scores.map((score) => (
                            <tr key={score.id}>
                              <td>{score.display_name || score.username}</td>
                              <td>{score.score}</td>
                              <td>{score.duration_seconds ? `${score.duration_seconds}s` : '---'}</td>
                              <td>{formatDate(score.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="panel-note">Chưa có điểm cao cho game này.</div>
                    )}
                  </article>

                  <article className="profile-card">
                    <div className="panel-heading">
                      <div>
                        <p className="section-tag">Đánh giá</p>
                        <h3>Nhận xét gần nhất</h3>
                      </div>
                    </div>
                    {gameDetail.recent_ratings?.length ? (
                      <ul className="review-list">
                        {gameDetail.recent_ratings.map((review) => (
                          <li key={review.id} className="review-item">
                            <div className="review-meta">
                              <strong>{review.display_name || review.username}</strong>
                              <span>{formatDate(review.updated_at)}</span>
                            </div>
                            <div className="review-rating">{Array.from({ length: review.rating }, (_, index) => '★').join('')}</div>
                            <p>{review.comment || 'Không có bình luận.'}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="panel-note">Chưa có đánh giá nào.</div>
                    )}
                  </article>
                </div>

                {user ? (
                  <article className="profile-card">
                    <div className="panel-heading">
                      <div>
                        <p className="section-tag">Gửi đánh giá</p>
                        <h3>Cảm nhận của bạn</h3>
                      </div>
                    </div>
                    <form onSubmit={submitRating} className="form-stack">
                      <label className="form-label">
                        Số sao
                        <select value={ratingForm.rating} onChange={updateRatingField('rating')}>
                          <option value={0}>Chọn...</option>
                          <option value={1}>1 sao</option>
                          <option value={2}>2 sao</option>
                          <option value={3}>3 sao</option>
                          <option value={4}>4 sao</option>
                          <option value={5}>5 sao</option>
                        </select>
                      </label>
                      <label className="form-label">
                        Bình luận
                        <textarea
                          rows={4}
                          value={ratingForm.comment}
                          onChange={updateRatingField('comment')}
                          placeholder="Viết cảm nhận của bạn..."
                        />
                      </label>
                      <div className="button-row">
                        <button className="btn btn-primary" type="submit" disabled={ratingSaving}>
                          {ratingSaving ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                      </div>
                    </form>
                  </article>
                ) : (
                  <div className="panel-note">
                    <p>Đăng nhập để gửi đánh giá và theo dõi game.</p>
                    <Link className="btn btn-secondary" to="/login">Đăng nhập</Link>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

/* */
