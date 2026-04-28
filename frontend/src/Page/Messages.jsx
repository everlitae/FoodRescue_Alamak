import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../Context/AuthContext';

function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [chatMsg, setChatMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const userId = user?.id || user?._id;

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  const fetchActive = async (id) => {
    try {
      const res = await api.get(`/conversations/${id}`);
      setActive(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelect = (conv) => {
    fetchActive(conv._id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() || !active) return;
    try {
      await api.post(`/conversations/${active._id}/messages`, { content: chatMsg });
      setChatMsg('');
      fetchActive(active._id);
      fetchConversations();
    } catch {}
  };

  const getOtherUser = (conv) => {
    if (!conv) return null;
    const isProvider = conv.provider_id?._id === userId || conv.provider_id === userId;
    return isProvider ? conv.seeker_id : conv.provider_id;
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return formatTime(date);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  return (
    <div className="container py-4 position-relative outfit">
      <h4 className="fw-bold text-green1 mb-4">
        <i className="bi bi-chat-dots me-2"></i>Pesan
      </h4>

      <div className="row g-0 rounded overflow-hidden" style={{ height: '70vh', border: "1px solid var(--txt3)" }}>

        {/* Sidebar Conversation List */}
        <div className="col-md-4" style={{ overflowY: 'auto' , borderInlineEnd:"1px solid var(--txt3)", borderBlockEnd:"1px solid var(--txt3)"}}>
          {conversations.length === 0 ? (
            <div className="text-center py-5 text-green4">
              <i className="bi bi-chat-square display-4"></i>
              <p className="mt-2 small">Belum ada percakapan</p>
            </div>
          ) : conversations.map(conv => {
            const other = getOtherUser(conv);
            const isActive = active?._id === conv._id;
            const lastMsg = conv.messages?.[conv.messages.length - 1];
            const isProvider = conv.provider_id?._id === userId || conv.provider_id === userId;
            const unread = isProvider ? conv.provider_unread : conv.seeker_unread;

            return (
              <div key={conv._id}
                className={`p-3 cursor-pointer ${isActive ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                style={{ cursor: 'pointer', borderBottom:"1px solid var(--txt3)" }}
                onClick={() => handleSelect(conv)}>
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 40, height: 40, fontSize: 18 }}>
                    {other?.first_name?.[0] || '?'}
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold text-green1 small">
                        {other?.first_name} {other?.last_name}
                      </span>
                      {conv.last_message_at && (
                        <small className="text-green3">{formatDate(conv.last_message_at)}</small>
                      )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-green3 text-truncate" style={{ maxWidth: '150px' }}>
                        {conv.donation_id?.title
                          ? <><i className="bi bi-basket2 me-1"></i>{conv.donation_id.title}</>
                          : lastMsg?.content || 'Mulai percakapan'}
                      </small>
                      {unread > 0 && (
                        <span className="badge bg-primary rounded-pill ms-1">{unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Area */}
        <div className="col-md-8 d-flex flex-column">
          {!active ? (
            <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
              <div className="text-center text-green4">
                <i className="bi bi-chat-dots display-3"></i>
                <p className="mt-2">Pilih percakapan untuk mulai chat</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-3 d-flex align-items-center gap-2" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 40, height: 40, fontSize: 18 }}>
                  {getOtherUser(active)?.first_name?.[0] || '?'}
                </div>
                <div>
                  <p className="fw-semibold text-green2 mb-0">
                    {getOtherUser(active)?.first_name} {getOtherUser(active)?.last_name}
                  </p>
                  {active.donation_id && (
                    <small className="text-green3">
                      <i className="bi bi-basket2 me-1"></i>{active.donation_id.title}
                    </small>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-grow-1 p-3 overflow-y-auto">
                {active.messages?.length === 0 ? (
                  <div className="text-center text-green4 py-4">
                    <p>Belum ada pesan. Mulai percakapan!</p>
                  </div>
                ) : active.messages.map(m => {
                  const isMe = m.sender_id === userId || m.sender_id?._id === userId;
                  return (
                    <div key={m._id}
                      className={`mb-3 d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                      <div className={`px-3 py-2 rounded-3 ${isMe ? 'bg-success text-white' : 'text-success border border-2 border-success'}`}
                        style={{ maxWidth: '70%', wordBreak: 'break-word' }}>
                        {m.is_deleted_by_sender
                          ? <em className="text-muted small">Pesan dihapus</em>
                          : m.content}
                      </div>
                      <small className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                        {formatTime(m.created_at)}
                      </small>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-3 sticky-bottom" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)", borderTop:"1px solid var(--txt3);"}}>
                <form onSubmit={handleSend}>
                  <div className="d-flex gap-2 align-items-end">
                    <textarea
                      className="form-control input-green"
                      placeholder="Tulis pesan... (Shift+Enter untuk baris baru)"
                      value={chatMsg}
                      rows={1}
                      style={{ resize: 'none' }}
                      onChange={e => setChatMsg(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                    />
                    <button className="btn btn-green-gradient px-3 flex-shrink-0" type="submit">
                      <i className="bi bi-send"></i>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;