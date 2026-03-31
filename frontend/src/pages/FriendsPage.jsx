import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function FriendsPage() {
  const { user } = useAuth();
  const [friendData, setFriendData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchData, setSearchData] = useState([]);
  const [currentTab, setCurrentTab] = useState('friends');

  useEffect(() => {
    fetchFriendsList();
  }, []);

  const fetchFriendsList = async () => {
    try {
      const f = await api.getFriends();
      const p = await api.getPendingRequests();
      setFriendData(f);
      setPendingData(p);
    } catch (e) {
      console.error(e);
    }
  };

  async function batDauTimKiem() {
    if (!searchQuery.trim()) return;
    try {
      const resp = await api.searchUsers(searchQuery);
      setSearchData(resp.filter(u => u.id !== user.id));
    } catch (err) {
      console.log(err);
    }
  }

  const guiLoiMoi = async (targetId) => {
    try {
      await api.sendFriendRequest(targetId);
      alert('Đã gửi!');
    } catch (err) {
      alert(err.message);
    }
  };

  const phanHoiYeuCau = async (rid, opt) => {
    try {
      await api.respondFriendRequest(rid, opt);
      fetchFriendsList();
    } catch (err) {
      alert(err.message);
    }
  };

  const xoaBan = async (fid) => {
    if (!confirm('Chắc chắn muốn xóa?')) return;
    try {
      await api.removeFriend(fid);
      fetchFriendsList();
    } catch (err) {
      alert(err.message);
    }
  };

  const hienThiNoiDung = () => {
    switch (currentTab) {
      case 'friends':
        return (
          <div className="card-grid">
            {friendData.length === 0 ? (
              <div className="empty-state">
                <div className="icon">👥</div>
                <p>Không có dữ liệu</p>
              </div>
            ) : friendData.map(item => (
              <div key={item.friendship_id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="avatar">{item.friend.display_name?.[0] || '?'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{item.friend.display_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{item.friend.username}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => xoaBan(item.friendship_id)}>Hủy kết bạn</button>
              </div>
            ))}
          </div>
        );
      case 'pending':
        return (
          <div className="card-grid">
            {pendingData.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📬</div>
                <p>Trống</p>
              </div>
            ) : pendingData.map(pData => (
              <div key={pData.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="avatar">{pData.display_name?.[0] || '?'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{pData.display_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{pData.username}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => phanHoiYeuCau(pData.id, 'accept')}>Đồng ý</button>
                  <button className="btn btn-danger btn-sm" onClick={() => phanHoiYeuCau(pData.id, 'reject')}>Từ chối</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'search':
        return (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input 
                className="form-input" 
                style={{ maxWidth: 400 }} 
                placeholder="Tìm..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && batDauTimKiem()} 
              />
              <button className="btn btn-primary" onClick={batDauTimKiem}>Tìm</button>
            </div>
            <div className="card-grid">
              {searchData.map(u => (
                <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="avatar">{u.display_name?.[0] || '?'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{u.display_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{u.username}</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => guiLoiMoi(u.id)}>Kết bạn</button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Danh sách bạn</h1>
        <p>Quản lý và tìm kiếm bạn bè</p>
      </div>

      <div className="tabs">
        <button className={`tab ${currentTab === 'friends' ? 'active' : ''}`} onClick={() => setCurrentTab('friends')}>Bạn bè ({friendData.length})</button>
        <button className={`tab ${currentTab === 'pending' ? 'active' : ''}`} onClick={() => setCurrentTab('pending')}>Lời mời ({pendingData.length})</button>
        <button className={`tab ${currentTab === 'search' ? 'active' : ''}`} onClick={() => setCurrentTab('search')}>Tìm kiếm</button>
      </div>

      {hienThiNoiDung()}
    </div>
  );
}
