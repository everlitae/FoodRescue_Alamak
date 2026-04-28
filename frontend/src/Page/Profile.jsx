import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../utils/api';
import { useAuth } from '../Context/AuthContext';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate()
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

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
    <div className="container outfit py-4">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card p-4" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>

            {/* Header */}
            <div className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 80, height: 80 }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" className="rounded-circle" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                  : <i className="bi bi-person-fill" style={{ fontSize: 40 }}></i>
                }
              </div>
              <h4 className="fw-bold text-green1">{profile.first_name} {profile.last_name}</h4>
              {profile.username && <p className="text-green3 mb-1">@{profile.username}</p>}
              <span className="badge badge-green">{ROLE_LABEL[profile.role]}</span>
              <div className="mt-2">
                <span className="text-warning">{'★'.repeat(Math.round(profile.trust_score || 0))}{'☆'.repeat(5 - Math.round(profile.trust_score || 0))}</span>
                <small className="text-green3 ms-1">Trust Score: {profile.trust_score?.toFixed(1) || '5.0'}</small>
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
                  <div className="card-green rounded p-2">
                    <h5 className="fw-bold text-green1 mb-0">{s.value}</h5>
                    <small className="text-green2">{s.label}</small>
                  </div>
                </div>
              ))}
            </div>

            {!editMode ? (
              <>
                <div className="mb-3">
                  <label className="form-label text-green3 small">Email</label>
                  <p className="fw-semibold text-green1 mb-0">{profile.email}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-green3 small">No. HP</label>
                  <p className="fw-semibold text-green1 mb-0">{profile.phone || '-'}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-green3 small">Kota</label>
                  <p className="fw-semibold text-green1 mb-0">{profile.city || '-'}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-green3 small">Bio</label>
                  <p className="fw-semibold text-green1 mb-0">{profile.profile?.bio || '-'}</p>
                </div>
                <div className="mb-4">
                  <label className="form-label text-green3 small">Bergabung sejak</label>
                  <p className="fw-semibold text-green1 mb-0">
                    {new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button className="btn btn-outline-danger w-100 mb-3" onClick={() => handleLogout()}>
                  <i className="bi bi-box-arrow-left me-1"></i>
                  Logout
                </button>
                <button className="btn btn-green-gradient w-100" onClick={() => setEditMode(true)}>
                  <i className="bi bi-pencil me-1"></i>Edit Profil
                </button>
              </>
            ) : (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label text-green3">Nama Depan</label>
                    <input className="form-control input-green" value={form.first_name}
                      onChange={e => setForm({ ...form, first_name: e.target.value })} />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-green3">Nama Belakang</label>
                    <input className="form-control input-green" value={form.last_name}
                      onChange={e => setForm({ ...form, last_name: e.target.value })} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-green3">Username</label>
                  <input className="form-control input-green" value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    placeholder="min. 6 karakter" minLength={6} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-green3">No. HP</label>
                  <input className="form-control input-green" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="cth: 08123456789" />
                </div>
                <div className="mb-3">
                  <label className="form-label text-green3">Kota</label>
                  <input className="form-control input-green" value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    placeholder="cth: Medan" />
                </div>
                <div className="mb-4">
                  <label className="form-label text-green3">Bio</label>
                  <textarea className="form-control input-green" rows={3} value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Ceritakan sedikit tentang dirimu..." maxLength={500} />
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-danger flex-grow-1" onClick={() => setEditMode(false)}>Batal</button>
                  <button className="btn btn-green-gradient flex-grow-1" onClick={handleSave}>Simpan</button>
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