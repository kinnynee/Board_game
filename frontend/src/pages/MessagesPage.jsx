import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function MessagesPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [dsHoiThoai, setDsHoiThoai] = useState([]);
  const [idHoiThoai, setIdHoiThoai] = useState(userId ? parseInt(userId) : null);
  const [dsTinNhan, setDsTinNhan] = useState([]);
  const [chuoiTinNhan, setChuoiTinNhan] = useState('');
  const msgEndRef = useRef(null);

  useEffect(() => {
    api.getConversations().then(res => {
      setDsHoiThoai(res);
    }).catch(e => console.log(e));
  }, []);

  useEffect(() => {
    if (idHoiThoai) {
      layDuLieuChat(idHoiThoai);
    }
  }, [idHoiThoai]);

  async function layDuLieuChat(chatId) {
    try {
      const msgs = await api.getMessages(chatId);
      setDsTinNhan(msgs);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (msgEndRef.current) {
      msgEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dsTinNhan]);

  const guiTinDi = async () => {
    if (!chuoiTinNhan.trim() || !idHoiThoai) return;
    try {
      const data = await api.sendMessage(idHoiThoai, chuoiTinNhan);
      setDsTinNhan(prev => {
        return [...prev, data];
      });
      setChuoiTinNhan('');
    } catch (ex) {
      alert(ex.message);
    }
  };

  let nguoiDangChat = null;
  for (let i = 0; i < dsHoiThoai.length; i++) {
    if (dsHoiThoai[i].user_id === idHoiThoai) {
      nguoiDangChat = dsHoiThoai[i].user;
      break;
    }
  }

  return (
    <div className="page-content">
      <div className="page-header"><h1>Tin nhắn</h1></div>
      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 200px)' }}>
        <div className="card" style={{ width: 300, overflowY: 'auto', padding: 0 }}>
          {dsHoiThoai.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center' }}><p>Trống</p></div>
          ) : dsHoiThoai.map(item => (
            <div key={item.user_id} onClick={() => setIdHoiThoai(item.user_id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer',
                borderBottom: '1px solid var(--border-light)', background: idHoiThoai === item.user_id ? 'var(--accent-light)' : 'transparent' }}>
              <div className="avatar avatar-sm">{item.user.display_name?.[0] || '?'}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.user.display_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.last_message}</div>
              </div>
              {item.unread > 0 && <span className="badge badge-info">{item.unread}</span>}
            </div>
          ))}
        </div>

        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
          {idHoiThoai ? (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 700 }}>
                {nguoiDangChat ? nguoiDangChat.display_name : `User ${idHoiThoai}`}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dsTinNhan.map(m => (
                  <div key={m.id} className={`message-bubble ${m.sender_id === user.id ? 'message-sent' : 'message-received'}`}>
                    {m.content}
                    <div className="message-time">{new Date(m.created_at).toLocaleTimeString()}</div>
                  </div>
                ))}
                <div ref={msgEndRef} />
              </div>
              <div style={{ padding: 16, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10 }}>
                <input className="form-input" value={chuoiTinNhan} onChange={e => setChuoiTinNhan(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && guiTinDi()} placeholder="Chat..." style={{ flex: 1 }} />
                <button className="btn btn-primary" onClick={guiTinDi}>Gửi</button>
              </div>
            </>
          ) : (
            <div className="empty-state"><p>Chọn một người để chat</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
