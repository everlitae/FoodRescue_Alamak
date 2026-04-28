import { useState, useEffect } from 'react';
import api from '../utils/api';

function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [community, setCommunity] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tab, setTab] = useState('stats');
  const [msg, setMsg] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon_emoji: '' });

  const fetchAll = () => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {});
    api.get('/admin/donations').then(r => setDonations(r.data)).catch(() => {});
    api.get('/admin/reports').then(r => setReports(r.data)).catch(() => {});
    api.get('/admin/conversations').then(r => setConversations(r.data)).catch(() => {});
    api.get('/admin/community').then(r => setCommunity(r.data)).catch(() => {});
    api.get('/admin/categories').then(r => setCategories(r.data)).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const toggleUser = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle`);
      showMsg(res.data.msg);
      api.get('/admin/users').then(r => setUsers(r.data));
    } catch {}
  };

  const deleteDonation = async (id) => {
    if (!window.confirm('Hapus donasi ini?')) return;
    try {
      await api.delete(`/admin/donations/${id}`);
      showMsg('Donasi dihapus');
      api.get('/admin/donations').then(r => setDonations(r.data));
      api.get('/admin/stats').then(r => setStats(r.data));
    } catch {}
  };

  const resolveReport = async (id, action) => {
    try {
      await api.put(`/admin/reports/${id}/${action}`);
      showMsg(`Laporan di-${action}`);
      api.get('/admin/reports').then(r => setReports(r.data));
      api.get('/admin/stats').then(r => setStats(r.data));
    } catch {}
  };

  const pinPost = async (id) => {
    try {
      const res = await api.put(`/admin/community/${id}/pin`);
      showMsg(res.data.msg);
      api.get('/admin/community').then(r => setCommunity(r.data));
    } catch {}
  };

  const seedCategories = async () => {
    try {
      await api.post('/categories/seed');
      showMsg('✅ Kategori default berhasil di-seed!');
      api.get('/admin/categories').then(r => setCategories(r.data));
    } catch {}
  };

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', newCategory);
      showMsg('✅ Kategori ditambahkan!');
      setNewCategory({ name: '', slug: '', icon_emoji: '' });
      api.get('/admin/categories').then(r => setCategories(r.data));
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.msg || 'Gagal'));
    }
  };

  const ROLE_LABEL = { food_provider: '🍱 Provider', food_seeker: '🤲 Seeker' };
  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID');
  const formatDateTime = (date) => new Date(date).toLocaleString('id-ID');

  const tabs = [
    { key: 'stats', label: '📊 Statistik' },
    { key: 'users', label: '👥 Pengguna' },
    { key: 'donations', label: '🍱 Donasi' },
    { key: 'reports', label: '🚨 Laporan', badge: reports.filter(r => r.status === 'pending').length },
    { key: 'conversations', label: '💬 Chat' },
    { key: 'community', label: '🏘️ Komunitas' },
    { key: 'categories', label: '🏷️ Kategori' },
  ];

  return (
    <div className="container position-relative outfit py-4">
      <h4 className="syne-h1 text-green1 mb-4">
        <i className="bi bi-shield-check me-2"></i>Admin Panel
      </h4>

      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <ul className="nav nav-tabs mb-4 flex-wrap">
        {tabs.map(t => (
          <li className="nav-item" key={t.key}>
            <button
              className={`nav-link ${tab === t.key ? 'active fw-semibold' : ''}`}
              onClick={() => setTab(t.key)}>
              {t.label}
              {t.badge > 0 && <span className="badge bg-danger ms-1">{t.badge}</span>}
            </button>
          </li>
        ))}
      </ul>

      {/* Statistik */}
      {tab === 'stats' && stats && (
        <div className="row g-3">
          {[
            { label: 'Total Pengguna', value: stats.totalUsers, icon: 'bi-people', color: 'primary' },
            { label: 'Food Provider', value: stats.totalProviders, icon: 'bi-basket2', color: 'warning' },
            { label: 'Food Seeker', value: stats.totalSeekers, icon: 'bi-person-heart', color: 'info' },
            { label: 'Total Donasi', value: stats.totalDonations, icon: 'bi-gift', color: 'success' },
            { label: 'Donasi Tersedia', value: stats.availableDonations, icon: 'bi-check-circle', color: 'success' },
            { label: 'Donasi Selesai', value: stats.completedDonations, icon: 'bi-trophy', color: 'warning' },
            { label: 'Total Klaim', value: stats.totalClaims, icon: 'bi-hand-index', color: 'info' },
            { label: 'Laporan Pending', value: stats.pendingReports, icon: 'bi-flag', color: 'danger' },
            { label: 'Post Komunitas', value: stats.totalPosts, icon: 'bi-chat-dots', color: 'primary' },
          ].map((s, i) => (
            <div className="col-md-4 col-6" key={i}>
              <div className="card p-3 text-center" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
                <i className={`bi ${s.icon} display-5 text-${s.color} mb-2`}></i>
                <h3 className="fw-bold text-green1 mb-0">{s.value}</h3>
                <small className="text-green3">{s.label}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pengguna */}
      {tab === 'users' && (
        <div className="table-responsive">
          <table className="table table-green align-middle">
            <thead>
              <tr>
                <th>Nama</th><th>Email</th><th>Role</th>
                <th>Trust Score</th><th>Status</th><th>Bergabung</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td className="fw-semibold">
                    {u.first_name} {u.last_name}
                    {u.username && <small className="text-muted d-block">@{u.username}</small>}
                  </td>
                  <td className="text-muted small">{u.email}</td>
                  <td><span className="badge badge-green">{ROLE_LABEL[u.role] || u.role}</span></td>
                  <td>
                    <span className="text-warning">★</span> {u.trust_score?.toFixed(1) || '5.0'}
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'bg-success' : 'bg-danger'}`}>
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="small">{formatDate(u.created_at)}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                      onClick={() => toggleUser(u._id)}>
                      {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-green4">Belum ada pengguna</p>}
        </div>
      )}

      {/* Donasi */}
      {tab === 'donations' && (
        <div className="table-responsive">
          <table className="table table-green">
            <thead className="table-light">
              <tr>
                <th>Judul</th><th>Provider</th><th>Kota</th>
                <th>Stok</th><th>Status</th><th>Tgl</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d._id}>
                  <td className="fw-semibold">
                    {d.category_id?.icon_emoji} {d.title}
                  </td>
                  <td className="small">{d.provider_id?.first_name} {d.provider_id?.last_name}</td>
                  <td className="small">{d.pickup_city}</td>
                  <td className="small">{d.quantity_remaining}/{d.quantity} {d.quantity_unit}</td>
                  <td>
                    <span className={`badge ${
                      d.status === 'available' ? 'bg-success' :
                      d.status === 'partially_claimed' ? 'bg-info' :
                      d.status === 'fully_claimed' ? 'bg-warning text-dark' :
                      d.status === 'completed' ? 'bg-secondary' :
                      'bg-danger'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="small">{formatDate(d.created_at)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteDonation(d._id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {donations.length === 0 && <p className="text-center text-green4">Belum ada donasi</p>}
        </div>
      )}

      {/* Laporan */}
      {tab === 'reports' && (
        <div className="table-responsive">
          <table className="table table-green">
            <thead className="table-light">
              <tr>
                <th>Pelapor</th><th>Tipe</th><th>Alasan</th>
                <th>Deskripsi</th><th>Status</th><th>Tgl</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r._id} className={r.status === 'pending' ? 'table-warning' : ''}>
                  <td className="small fw-semibold">
                    {r.reporter_id?.first_name} {r.reporter_id?.last_name}
                  </td>
                  <td><span className="badge bg-light text-dark border">{r.reportable_type}</span></td>
                  <td className="small">{r.reason?.replace('_', ' ')}</td>
                  <td className="small text-muted" style={{ maxWidth: '150px' }}>
                    {r.description || '-'}
                  </td>
                  <td>
                    <span className={`badge ${
                      r.status === 'pending' ? 'bg-warning text-dark' :
                      r.status === 'resolved' ? 'bg-success' :
                      r.status === 'dismissed' ? 'bg-secondary' : 'bg-info'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="small">{formatDate(r.created_at)}</td>
                  <td>
                    {r.status === 'pending' && (
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-success"
                          onClick={() => resolveReport(r._id, 'resolve')}>
                          Resolve
                        </button>
                        <button className="btn btn-sm btn-outline-secondary"
                          onClick={() => resolveReport(r._id, 'dismiss')}>
                          Dismiss
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && <p className="text-center text-green4">Belum ada laporan</p>}
        </div>
      )}

      {/* Chat */}
      {tab === 'conversations' && (
        <div className="table-responsive">
          <table className="table table-green">
            <thead className="table-light">
              <tr>
                <th>Donasi</th><th>Provider</th><th>Seeker</th>
                <th>Jml Pesan</th><th>Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map(c => (
                <tr key={c._id}>
                  <td className="small fw-semibold">{c.donation_id?.title || '-'}</td>
                  <td className="small">{c.provider_id?.first_name} {c.provider_id?.last_name}</td>
                  <td className="small">{c.seeker_id?.first_name} {c.seeker_id?.last_name}</td>
                  <td><span className="badge bg-primary">{c.messages?.length || 0}</span></td>
                  <td className="small text-muted">
                    {c.last_message_at ? formatDateTime(c.last_message_at) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {conversations.length === 0 && <p className="text-center text-green4">Belum ada percakapan</p>}
        </div>
      )}

      {/* Komunitas */}
      {tab === 'community' && (
        <div className="table-responsive">
          <table className="table table-green">
            <thead className="table-light">
              <tr>
                <th>Judul</th><th>Penulis</th><th>Tipe</th>
                <th>Like</th><th>Komentar</th><th>Pin</th><th>Tgl</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {community.map(p => (
                <tr key={p._id}>
                  <td className="fw-semibold small">{p.title}</td>
                  <td className="small">{p.author_id?.first_name} {p.author_id?.last_name}</td>
                  <td><span className="badge badge-green">{p.type}</span></td>
                  <td>{p.like_count}</td>
                  <td>{p.comment_count}</td>
                  <td>{p.is_pinned ? '📌' : '-'}</td>
                  <td className="small">{formatDate(p.created_at)}</td>
                  <td>
                    <button className={`btn btn-sm ${p.is_pinned ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => pinPost(p._id)}>
                      <i className="bi bi-pin"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {community.length === 0 && <p className="text-center text-green4">Belum ada post</p>}
        </div>
      )}

      {/* Kategori */}
      {tab === 'categories' && (
        <>
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-outline-green btn-sm" onClick={seedCategories}>
              <i className="bi bi-database me-1"></i>Seed Kategori Default
            </button>
          </div>

          {/* Form Tambah Kategori */}
          <div className="card p-3 mb-4" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
            <h6 className="fw-bold text-green1 mb-3">➕ Tambah Kategori Baru</h6>
            <form onSubmit={addCategory}>
              <div className="row g-2">
                <div className="col-md-3">
                  <input className="form-control form-control-sm input-green" placeholder="Nama"
                    value={newCategory.name}
                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                    required />
                </div>
                <div className="col-md-3">
                  <input className="form-control form-control-sm input-green" placeholder="Slug (cth: makanan-siap-saji)"
                    value={newCategory.slug}
                    onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                    required />
                </div>
                <div className="col-md-2">
                  <input className="form-control form-control-sm input-green" placeholder="Emoji (cth: 🍚)"
                    value={newCategory.icon_emoji}
                    onChange={e => setNewCategory({ ...newCategory, icon_emoji: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-green-gradient btn-sm w-100">Tambah</button>
                </div>
              </div>
            </form>
          </div>

          <div className="table-responsive">
            <table className="table table-green">
              <thead className="table-light">
                <tr>
                  <th>Emoji</th><th>Nama</th><th>Slug</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontSize: '1.5rem' }}>{c.icon_emoji}</td>
                    <td className="fw-semibold">{c.name}</td>
                    <td className="text-muted small">{c.slug}</td>
                    <td>
                      <span className={`badge ${c.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {c.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {categories.length === 0 && (
              <p className="text-center text-green4">
                Belum ada kategori. Klik "Seed Kategori Default" untuk mulai.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Admin;