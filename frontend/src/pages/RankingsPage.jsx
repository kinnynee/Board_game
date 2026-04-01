import { useState, useEffect } from 'react';
import api from '../api';

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function RankingsPage({ onBack }) {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Lần 4: Thêm State cho Search và Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    // Truyền tham số lọc và phân trang lên API
    api.get(`/rankings?page=${currentPage}&search=${searchTerm}`)
      .then((res) => {
        // Cấu trúc API mới trả về có chứa results và pagination
        const responseData = res.data.data;
        if (responseData.results) {
          setRankings(responseData.results);
          setTotalPages(responseData.pagination.totalPages);
        } else {
          setRankings(responseData); // Fallback nếu lỡ lỗi
        }
      })
      .catch(() => {
        setError('Không thể tải bảng xếp hạng. Vui lòng thử lại.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentPage, searchTerm]); // Gọi lại API mỗi khi chuyển đổi trang hoặc tìm kiếm tên khác

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset vể trang 1 mỗi khi bắt đầu tìm kiếm người mới
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <button className="btn-back" onClick={onBack} style={{ marginBottom: '15px', padding: '8px 16px', cursor: 'pointer' }}>← Quay lại</button>
        <h1 style={{ color: '#FFD700', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>🏆 Bảng Xếp Hạng</h1>
        <p>Top {rankings.length === 0 ? '' : '10'} người chơi xuất sắc nhất Server</p>
      </div>

      {/* Lần 4: Form Tìm Kiếm */}
      <form onSubmit={handleSearch} className="search-form" style={{ marginBottom: '25px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="🔍 Nhập tên người chơi cần tìm..." 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ padding: '12px 16px', flex: 1, borderRadius: '8px', border: '1px solid #444', backgroundColor: '#1a1a2e', color: 'white', fontSize: '1rem' }}
        />
        <button type="submit" style={{ padding: '12px 24px', cursor: 'pointer', background: 'linear-gradient(45deg, #4CAF50, #2E7D32)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          Tìm kiếm
        </button>
      </form>

      {isLoading && (
        <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p>Đang đồng bộ dữ liệu xếp hạng...</p>
        </div>
      )}

      {error && (
        <div className="error-state" style={{ color: '#ff6b6b', padding: '20px', backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '8px', textAlign: 'center' }}>
          <p>⚠️ {error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="rankings-table-wrapper" style={{ backgroundColor: '#16213e', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <table className="rankings-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#0f3460', color: 'white' }}>
              <tr>
                <th style={{ padding: '16px' }}>Hạng</th>
                <th style={{ padding: '16px' }}>Tên người chơi</th>
                <th style={{ padding: '16px' }}>Điểm số</th>
                <th style={{ padding: '16px' }}>Thắng</th>
                <th style={{ padding: '16px' }}>Thua</th>
              </tr>
            </thead>
            <tbody>
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    Không tìm thấy người chơi "{searchTerm}" trong hệ thống.
                  </td>
                </tr>
              ) : (
                rankings.map((player) => (
                  <tr key={player.rank} style={{ borderBottom: '1px solid #1f2937', transition: 'background-color 0.2s' }} className="ranking-row">
                    <td style={{ padding: '16px', fontSize: '1.2rem' }}>
                      {RANK_MEDALS[player.rank] || `#${player.rank}`}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#e94560' }}>{player.username}</td>
                    <td style={{ padding: '16px', color: '#f9a826', fontWeight: 'bold' }}>{player.score.toLocaleString()}</td>
                    <td style={{ padding: '16px', color: '#4caf50' }}>{player.wins}</td>
                    <td style={{ padding: '16px', color: '#f44336' }}>{player.losses}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Lần 4: Thanh Phân Trang (Pagination) */}
          {totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '20px', backgroundColor: '#0f3460' }}>
               <button 
                 disabled={currentPage === 1} 
                 onClick={() => setCurrentPage(p => p - 1)}
                 style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: currentPage === 1 ? '#555' : '#e94560', color: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
               >
                 Trang Trước
               </button>
               <span style={{ display: 'flex', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>
                 Trang {currentPage} / {totalPages}
               </span>
               <button 
                 disabled={currentPage === totalPages} 
                 onClick={() => setCurrentPage(p => p + 1)}
                 style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: currentPage === totalPages ? '#555' : '#e94560', color: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
               >
                 Trang Sau
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
