import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../utils/api';
import MapPicker from '../Component/MapPicker';

function CreateDonation() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [photos, setPhotos] = useState([]);
  const [coords, setCoords] = useState({ lat: 3.5952, lng: 98.6722 });
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    quantity: '',
    quantity_unit: '',
    pickup_address: '',
    pickup_city: '',
    pickup_notes: '',
    pickup_start_time: '',
    pickup_end_time: '',
    expired_at: '',
    is_halal: '',
    allergen_notes: '',
  });

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setMsg('❌ Maksimal 5 foto');
      return;
    }
    setPhotos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') formData.append(k, v);
      });
      formData.append('latitude', coords.lat);
      formData.append('longitude', coords.lng);
      photos.forEach(p => formData.append('photos', p));

      await api.post('/donations', formData);
      setMsg('✅ Donasi berhasil dibuat!');
      setTimeout(() => navigate('/donations'), 1500);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.msg || 'Gagal membuat donasi'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)",maxWidth: "900px"}}>
            <h4 className="text-green1 syne-h1 mb-4">
              <i className="bi bi-plus-circle me-2"></i>Buat Donasi Baru
            </h4>

            {msg && <div className="alert alert-info">{msg}</div>}

            <form onSubmit={handleSubmit} className='outfit text-green2'>
              <h6 className="fw-bold text-green2 mb-3">📋 Informasi Donasi</h6>

              <div className="mb-3">
                <label className="form-label">Judul Donasi <span className="text-danger">*</span></label>
                <input type="text" name="title" className="form-control input-green"
                  value={form.title} onChange={handleChange} required
                  placeholder="cth: Nasi Kotak Sisa Acara" />
              </div>

              <div className="mb-3">
                <label className="form-label">Deskripsi</label>
                <textarea name="description" className="form-control input-green" rows={3}
                  value={form.description} onChange={handleChange}
                  placeholder="Jelaskan kondisi makanan, isi, dll..." />
              </div>

              <div className="mb-3">
                <label className="form-label">Kategori <span className="text-danger">*</span></label>
                <select name="category_id" className="form-select input-green"
                  value={form.category_id} onChange={handleChange} required>
                  <option value="">Pilih kategori...</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.icon_emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Jumlah <span className="text-danger">*</span></label>
                  <input type="number" name="quantity" className="form-control input-green"
                    value={form.quantity} onChange={handleChange} required min={1}
                    placeholder="cth: 10" />
                </div>
                <div className="col-6">
                  <label className="form-label">Satuan <span className="text-danger">*</span></label>
                  <input type="text" name="quantity_unit" className="form-control input-green"
                    value={form.quantity_unit} onChange={handleChange} required
                    placeholder="cth: porsi, kg, bungkus" />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Halal?</label>
                  <select name="is_halal" className="form-select input-green"
                    value={form.is_halal} onChange={handleChange}>
                    <option value="">Tidak Tahu</option>
                    <option value="true">✅ Halal</option>
                    <option value="false">❌ Tidak Berlabel Halal</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Expired / Batas Ambil <span className="text-danger">*</span></label>
                  <input type="datetime-local" name="expired_at" className="form-control input-green"
                    value={form.expired_at} onChange={handleChange} required />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Catatan Alergen</label>
                <input type="text" name="allergen_notes" className="form-control input-green"
                  value={form.allergen_notes} onChange={handleChange}
                  placeholder="cth: mengandung kacang, seafood, dll" />
              </div>

              <hr />

              <h6 className="fw-bold mb-3">📍 Lokasi Pickup</h6>

              <div className="mb-3">
                <label className="form-label">Alamat Lengkap <span className="text-danger">*</span></label>
                <input type="text" name="pickup_address" className="form-control input-green"
                  value={form.pickup_address} onChange={handleChange} required
                  placeholder="cth: Jl. Sudirman No. 123" />
              </div>

              <div className="mb-3">
                <label className="form-label">Kota <span className="text-danger">*</span></label>
                <input type="text" name="pickup_city" className="form-control input-green"
                  value={form.pickup_city} onChange={handleChange} required
                  placeholder="cth: Medan" />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Lokasi Pickup di Peta <span className="text-danger">*</span>
                </label>
                <MapPicker
                  lat={coords.lat}
                  lng={coords.lng}
                  onChange={(pos) => setCoords(pos)}
                  onAddress={(result) => {
                    setForm(prev => ({
                      ...prev,
                      pickup_address: result.address_line || prev.pickup_address,
                      pickup_city: result.city || prev.pickup_city,
                    }));
                  }}
                  searchQuery={form.pickup_address}
                />
                <small className="mt-1 d-block">
                  📍 Koordinat: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </small>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Jam Mulai Pickup</label>
                  <input type="time" name="pickup_start_time" className="form-control input-green"
                    value={form.pickup_start_time} onChange={handleChange} />
                </div>
                <div className="col-6">
                  <label className="form-label">Jam Selesai Pickup</label>
                  <input type="time" name="pickup_end_time" className="form-control input-green"
                    value={form.pickup_end_time} onChange={handleChange} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Catatan Pickup</label>
                <textarea name="pickup_notes" className="form-control input-green" rows={2}
                  value={form.pickup_notes} onChange={handleChange}
                  placeholder="cth: Hubungi dulu sebelum datang, parkir di depan" />
              </div>

              <hr />

              <h6 className="fw-bold mb-3">📷 Foto (Maks. 5)</h6>
              <div className="mb-4">
                <input type="file" className="form-control input-green" accept="image/*"
                  multiple onChange={handlePhotoChange} />
                <small className="text-muted">Format: JPG, PNG. Maks 5MB per foto.</small>
                {photos.length > 0 && (
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {photos.map((p, i) => (
                      <img key={i} src={URL.createObjectURL(p)} alt={`preview-${i}`}
                        className="rounded" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-green-gradient w-100" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...</>
                ) : (
                  <><i className="bi bi-plus-circle me-1"></i>Buat Donasi</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateDonation;