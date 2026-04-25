import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../Context/AuthContext';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '',
    phone: '', city: '', bio: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/profile')
      .then(res => {
        setProfile(res.data);
        setForm({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          username: res.data.username || '',
          phone: res.data.phone || '',
          city: res.data.city || '',
          bio: res.data.profile?.bio || '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const res = await api.put('/users/profile', form);
      setProfile(res.data);
      setEditMode(false);
      setMsg('✅ Profil berhasil diperbarui!');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('❌ Gagal memperbarui profil');
    }
  };

  const ROLE_LABEL = {
    food_provider: '🍱 Food Provider',
    food_seeker: '🤲 Food Seeker',
    admin: '⚙️ Admin'
  };

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card p-4">

            {/* Header */}
            <div className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 80, height: 80 }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" className="rounded-circle" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                  : <i className="bi bi-person-fill" style={{ fontSize: 40 }}></i>
                }
              </div>
              <h4 className="fw-bold">{profile.first_name} {profile.last_name}</h4>
              {profile.username && <p className="text-muted mb-1">@{profile.username}</p>}
              <span className="badge bg-light text-dark border">{ROLE_LABEL[profile.role]}</span>
              <div className="mt-2">
                <span className="text-warning">{'★'.repeat(Math.round(profile.trust_score || 0))}{'☆'.repeat(5 - Math.round(profile.trust_score || 0))}</span>
                <small className="text-muted ms-1">Trust Score: {profile.trust_score?.toFixed(1) || '5.0'}</small>
              </div>
            </div>

            {msg && <div className="alert alert-info py-2">{msg}</div>}

            {/* Stats */}
            <div className="row g-2 mb-4 text-center">
              {[
                { label: 'Donasi', value: profile.profile?.total_donations || 0 },
                { label: 'Klaim', value: profile.profile?.total_claims || 0 },
                { label: 'Poin', value: profile.total_points || 0 },
              ].map((s, i) => (
                <div className="col-4" key={i}>
                  <div className="bg-light rounded p-2">
                    <h5 className="fw-bold mb-0">{s.value}</h5>
                    <small className="text-muted">{s.label}</small>
                  </div>
                </div>
              ))}
            </div>

            {!editMode ? (
              <>
                <div className="mb-3">
                  <label className="form-label text-muted small">Email</label>
                  <p className="fw-semibold mb-0">{profile.email}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">No. HP</label>
                  <p className="fw-semibold mb-0">{profile.phone || '-'}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">Kota</label>
                  <p className="fw-semibold mb-0">{profile.city || '-'}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small">Bio</label>
                  <p className="fw-semibold mb-0">{profile.profile?.bio || '-'}</p>
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted small">Bergabung sejak</label>
                  <p className="fw-semibold mb-0">
                    {new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button className="btn btn-primary w-100" onClick={() => setEditMode(true)}>
                  <i className="bi bi-pencil me-1"></i>Edit Profil
                </button>
              </>
            ) : (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label">Nama Depan</label>
                    <input className="form-control" value={form.first_name}
                      onChange={e => setForm({ ...form, first_name: e.target.value })} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Nama Belakang</label>
                    <input className="form-control" value={form.last_name}
                      onChange={e => setForm({ ...form, last_name: e.target.value })} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input className="form-control" value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    placeholder="min. 6 karakter" minLength={6} />
                </div>
                <div className="mb-3">
                  <label className="form-label">No. HP</label>
                  <input className="form-control" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="cth: 08123456789" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Kota</label>
                  <input className="form-control" value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    placeholder="cth: Medan" />
                </div>
                <div className="mb-4">
                  <label className="form-label">Bio</label>
                  <textarea className="form-control" rows={3} value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Ceritakan sedikit tentang dirimu..." maxLength={500} />
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary flex-grow-1" onClick={() => setEditMode(false)}>Batal</button>
                  <button className="btn btn-primary flex-grow-1" onClick={handleSave}>Simpan</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;