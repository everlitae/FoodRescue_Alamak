import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../Context/AuthContext';

function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    type: 'discussion', title: '', content: '', tags: ''
  });

  const userId = user?.id || user?._id;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab !== 'all') params.append('type', tab);
      const res = await api.get(`/community?${params.toString()}`);
      setPosts(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPosts(); }, [tab]);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      await api.post('/community', payload);
      setMsg('✅ Post berhasil dibuat!');
      setShowForm(false);
      setForm({ type: 'discussion', title: '', content: '', tags: '' });
      fetchPosts();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.msg || 'Gagal membuat post'));
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.put(`/community/${postId}/like`);
      fetchPosts();
      if (activePost?._id === postId) {
        const res = await api.get(`/community/${postId}?noview=1`);
        setActivePost(res.data);
      }
    } catch {}
  };

  const handleOpenPost = async (post) => {
    try {
      const res = await api.get(`/community/${post._id}`);
      setActivePost(res.data);
      fetchPosts();
    } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.post(`/community/${activePost._id}/comments`, { content: commentText });
      setCommentText('');
      const res = await api.get(`/community/${activePost._id}?noview=1`);
      setActivePost(res.data);
      fetchPosts();
    } catch {}
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Hapus post ini?')) return;
    try {
      await api.delete(`/community/${postId}`);
      setMsg('✅ Post dihapus');
      setActivePost(null);
      fetchPosts();
    } catch {}
  };

  const TYPE_LABEL = {
    tips: { label: '💡 Tips', color: 'success' },
    success_story: { label: '🌟 Kisah Sukses', color: 'warning' },
    question: { label: '❓ Pertanyaan', color: 'info' },
    discussion: { label: '💬 Diskusi', color: 'primary' },
    announcement: { label: '📢 Pengumuman', color: 'danger' },
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const tabs = [
    { key: 'all', label: '🏠 Semua' },
    { key: 'tips', label: '💡 Tips' },
    { key: 'success_story', label: '🌟 Kisah Sukses' },
    { key: 'question', label: '❓ Pertanyaan' },
    { key: 'discussion', label: '💬 Diskusi' },
  ];

  return (
    <div className="container position-relative py-4 outfit" style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="syne-h1 text-green1 mb-0">
          <i className="bi bi-people me-2"></i>Komunitas
        </h4>
        <button className="btn btn-outline-green" onClick={() => setShowForm(!showForm)}>
          <i className="bi bi-plus-circle me-1"></i>Buat Post
        </button>
      </div>

      {msg && <div className="alert alert-info py-2">{msg}</div>}

      {/* Form Buat Post */}
      {showForm && (
        <div className="card outfit p-4 mb-4" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
          <h6 className="fw-bold text-green1 mb-3">✍️ Buat Post Baru</h6>
          <form onSubmit={handleSubmitPost}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label text-green2">Tipe Post</label>
                <select className="form-select input-green" value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}>
                  {Object.entries(TYPE_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label text-green2">Judul <span className="text-danger">*</span></label>
                <input type="text" className="form-control input-green"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  required placeholder="Judul post kamu..." />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label text-green2">Konten <span className="text-danger">*</span></label>
              <textarea className="form-control input-green" rows={4}
                value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                required placeholder="Tulis konten post kamu..." />
            </div>
            <div className="mb-3">
              <label className="form-label text-green2">Tags <small className="text-muted">(pisah dengan koma)</small></label>
              <input type="text" className="form-control input-green"
                value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="cth: tips, makanan, donasi" />
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-danger"
                onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn btn-green-gradient">
                <i className="bi bi-send me-1"></i>Post
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="row g-4">
        {/* List Post */}
        <div className={activePost ? 'col-md-5' : 'col-12'}>
          {/* Tab Filter */}
          <ul className="nav nav-tabs mb-3">
            {tabs.map(t => (
              <li className="nav-item" key={t.key}>
                <button className={`nav-link py-1 ${tab === t.key ? 'active fw-semibold' : 'text-green4'}`}
                  onClick={() => { setTab(t.key); setActivePost(null); }}>
                  {t.label}
                </button>
              </li>
            ))}
          </ul>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-5 text-green4">
              <i className="bi bi-chat-square display-3"></i>
              <p className="mt-2">Belum ada post</p>
            </div>
          ) : posts.map(p => (
            <div key={p._id}
              className={`card mb-3 cursor-pointer ${activePost?._id === p._id ? 'border-success' : ''}` }
              style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)", cursor: 'pointer'}}
              onClick={() => handleOpenPost(p)}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div className="d-flex gap-2 align-items-center">
                    {p.is_pinned && <i className="bi bi-pin-fill text-danger"></i>}
                    <span className={`badge bg-${TYPE_LABEL[p.type]?.color}`}>
                      {TYPE_LABEL[p.type]?.label}
                    </span>
                  </div>
                  <small className="text-green3">{formatDate(p.created_at)}</small>
                </div>
                <h6 className="fw-bold text-green1 mb-1">{p.title}</h6>
                <p className="text-green2 small mb-2" style={{
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                }}>
                  {p.content}
                </p>
                <div className="d-flex align-items-center gap-3">
                  <small className="text-green3">
                    <i className="bi bi-person me-1"></i>
                    {p.author_id?.first_name} {p.author_id?.last_name}
                  </small>
                  <small className="text-green3">
                    <i className="bi bi-heart me-1"></i>{p.like_count}
                  </small>
                  <small className="text-green3">
                    <i className="bi bi-chat me-1"></i>{p.comment_count}
                  </small>
                  <small className="text-green3">
                    <i className="bi bi-eye me-1"></i>{p.view_count}
                  </small>
                  {p.tags?.length > 0 && (
                    <div className="d-flex gap-1 flex-wrap">
                      {p.tags.slice(0, 3).map((t, i) => (
                        <span key={i} className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Post */}
        {activePost && (
          <div className="col-md-7">
            <div className="card p-4" style={{ backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)",top: '1rem', maxHeight: '85vh', overflowY: 'auto' }}>
              {/* Header Post */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className={`badge bg-${TYPE_LABEL[activePost.type]?.color}`}>
                  {TYPE_LABEL[activePost.type]?.label}
                </span>
                <div className="d-flex gap-2">
                  {(activePost.author_id?._id === userId || activePost.author_id === userId) && (
                    <button className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeletePost(activePost._id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                  <button className="btn btn-outline-green btn-sm"
                    onClick={() => setActivePost(null)}>
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              </div>

              <h5 className="fw-bold text-green1 mb-1">{activePost.title}</h5>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 28, height: 28, fontSize: 13 }}>
                  {activePost.author_id?.first_name?.[0]}
                </div>
                <small className="text-green3">
                  {activePost.author_id?.first_name} {activePost.author_id?.last_name}
                  <span className={`badge ms-2 ${activePost.author_id?.role === 'food_provider' ? 'card-green text-green1' : 'card-cream text-cream1'}`}>
                    {activePost.author_id?.role === 'food_provider' ? '🍱 Provider' : '🤲 Seeker'}
                  </span>
                </small>
                <small className="text-green4 ms-auto">{formatDate(activePost.created_at)}</small>
              </div>

              <p className="mb-3 text-green2" style={{ whiteSpace: 'pre-wrap' }}>{activePost.content}</p>

              {activePost.tags?.length > 0 && (
                <div className="d-flex gap-1 flex-wrap mb-3">
                  {activePost.tags.map((t, i) => (
                    <span key={i} className="badge badge-green text-green1">#{t}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="d-flex gap-3 mb-4">
                <button className={`btn btn-sm ${activePost.liked_by?.includes(userId) ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => handleLike(activePost._id)}>
                  <i className="bi bi-heart me-1"></i>{activePost.like_count}
                </button>
                <small className="text-green3 d-flex align-items-center">
                  <i className="bi bi-eye me-1"></i>{activePost.view_count} views
                </small>
              </div>

              <hr style={{borderColor: "var(--txt)"}}/>

              {/* Komentar */}
              <h6 className="fw-bold mb-3 text-green1">
                <i className="bi bi-chat me-1"></i>Komentar ({activePost.comment_count})
              </h6>

              {activePost.comments?.filter(c => !c.is_deleted).map(c => (
                <div key={c._id} className="d-flex gap-2 mb-3">
                  <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 32, height: 32, fontSize: 14 }}>
                    {c.author_id?.first_name?.[0] || '?'}
                  </div>
                  <div className="flex-grow-1">
                    <div className="input-green rounded p-2">
                      <p className="fw-semibold mb-0 small">
                        {c.author_id?.first_name} {c.author_id?.last_name}
                      </p>
                      <p className="mb-0 small">{c.content}</p>
                    </div>
                    <small className="text-green3">{formatDate(c.created_at)}</small>
                  </div>
                </div>
              ))}

              {/* Form Komentar */}
              {user && (
                <form onSubmit={handleComment} className="mt-2">
                  <textarea
                    className="form-control form-control-sm mb-2 input-green"
                    placeholder="Tulis komentar... (Shift+Enter untuk baris baru)"
                    value={commentText}
                    rows={2}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleComment(e);
                      }
                    }}
                  />
                  <button className="btn btn-green-gradient btn-sm w-100" type="submit">
                    <i className="bi bi-send me-1"></i>Kirim
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Community;