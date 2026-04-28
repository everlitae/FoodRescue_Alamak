import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import api from '../utils/api';
import MapView from '../Component/MapView';
import BadgeGreen from '../Component/BadgeGreen';

function Donations() {
  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '', city: '', search: '', halal: '',
    pickup_start: '', pickup_end: ''
  });
  const [radius, setRadius] = useState(10);
  const [userPos, setUserPos] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.city) params.append('city', filter.city);
      if (filter.search) params.append('search', filter.search);
      if (filter.halal) params.append('halal', filter.halal);

      const res = await api.get(`/donations?${params.toString()}`);
      setDonations(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));

    setLocationLoading(true);

    // Coba dengan IP-based geolocation sebagai fallback
    const tryGetLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;

        console.log("Akurasi:", accuracy);

        setUserPos({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy, // 🔥 TAMBAHAN
        });

        setLocationLoading(false);

        // 🔥 warning kalau tidak akurat
        if (accuracy > 100) {
          console.warn("Lokasi kurang akurat:", accuracy, "meter");
        }
      },
        err => {
          // Fallback pakai IP geolocation gratis
          fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(data => {
              if (data.latitude && data.longitude) {
                setUserPos({ lat: data.latitude, lng: data.longitude });
                setLocationLoading(false);
              } else {
                setLocationError('Gagal deteksi lokasi');
                setLocationLoading(false);
              }
            })
            .catch(() => {
              setLocationError('Gagal deteksi lokasi');
              setLocationLoading(false);
            });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    tryGetLocation();
  }, []);

  useEffect(() => { fetchDonations(); }, [filter]);

  // Filter by radius
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Filter by jam pickup
  const isInTimeRange = (d) => {
    if (!filter.pickup_start || !filter.pickup_end) return true;
    if (!d.pickup_start_time || !d.pickup_end_time) return false;
    return d.pickup_start_time >= filter.pickup_start &&
      d.pickup_end_time <= filter.pickup_end;
  };

const filteredDonations = donations.filter(d => {
  // Filter radius — skip kalau koordinat 0,0
  if (userPos) {
    const coords = d.pickup_location?.coordinates;
    if (coords && !(coords[0] === 0 && coords[1] === 0)) {
      const dist = getDistance(userPos.lat, userPos.lng, coords[1], coords[0]);
      if (dist > radius) return false;
    }
  }
  // Filter halal
  if (filter.halal === 'true' && d.is_halal !== true) return false;
  if (filter.halal === 'false' && d.is_halal !== false) return false;
  // Filter jam tutup
  if (!isInTimeRange(d)) return false;
  return true;
});

  const getStatusBadge = (status) => {
    if (status === 'available') return <span className="badge bg-success">Tersedia</span>;
    if (status === 'partially_claimed') return <span className="badge bg-info">Sebagian Diklaim</span>;
    return <span className="badge bg-secondary">{status}</span>;
  };

  return (
    <div className="container-fluid py-4">
      <div className="row g-0 outfit">
        {/* Kiri — Peta */}
        <div className="col-md-5 pe-3 d-flex flex-column" style={{ height: 'calc(100vh - 80px)' }}>
          <h5 className="text-green1 syne-h1 mb-2">
            <i className="bi bi-map me-2"></i>Peta Donasi
          </h5>
        <div style={{ flex: 1, minHeight: 0}}>
          <MapView donations={filteredDonations} userPos={userPos} />
        </div>

          {/* Slider Radius */}
          <div className="card p-3 mt-3" style={{backgroundColor: "var(--surface)", borderColor:"var(--border)", boxShadow:"var(--shadow)"}}>
            <label className="form-label text-green1 fw-semibold mb-1">
              <i className="bi bi-geo-alt me-1"></i>
              Radius: <span className="text-green3">{radius} km</span>
            </label>

            {locationLoading && (
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="spinner-border spinner-border-sm text-primary"></div>
                <small className="text-muted">Mendeteksi lokasi...</small>
              </div>
            )}

            {!userPos && !locationLoading && (
              <button className="btn btn-outline-green btn-sm text-green1 mb-2 w-100"
                onClick={() => {
                  setLocationLoading(true);
                  setLocationError('');
                  navigator.geolocation?.getCurrentPosition(
                    pos => {
                      const { latitude, longitude, accuracy } = pos.coords;

                      setUserPos({
                        lat: latitude,
                        lng: longitude,
                        accuracy: accuracy, // 🔥 TAMBAHAN
                      });

                      setLocationLoading(false);

                      // 🔥 kasih warning kalau jelek
                      if (accuracy > 100) {
                        alert("Lokasi kurang akurat (" + accuracy + " meter)");
                      }
                    },
                    () => {
                      fetch('https://ipapi.co/json/')
                        .then(r => r.json())
                        .then(data => {
                          if (data.latitude && data.longitude) {
                            setUserPos({ lat: data.latitude, lng: data.longitude });
                          } else {
                            setLocationError('Gagal deteksi lokasi');
                          }
                          setLocationLoading(false);
                        })
                        .catch(() => {
                          setLocationError('Gagal deteksi lokasi');
                          setLocationLoading(false);
                        });
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                  );
                }}>
                <i className="bi bi-crosshair me-1"></i>Deteksi Lokasi Saya
              </button>
            )}

            {userPos && (
              <small className="text-success mb-2 d-block">
                <i className="bi bi-check-circle me-1"></i>
                Lokasi terdeteksi — filter radius aktif
              </small>
            )}

            {locationError && (
              <small className="text-danger mb-2 d-block">
                <i className="bi bi-exclamation-triangle me-1"></i>{locationError}
              </small>
            )}

            <input type="range" className="form-range custom-range" min="1" max="50" value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              disabled={!userPos} />
            <div className="d-flex justify-content-between">
              <small className="text-green2">1 km</small>
              <small className="text-green2">50 km</small>
            </div>
          </div>
        </div>

        {/* Kanan — Filter + List */}
        <div className="col-md-7 mt-3 mt-md-0" style={{ overflowY: 'auto', overflowX:'auto', height: 'calc(100vh - 80px)' }}>
          <h5 className="mb-2 text-green1 syne-h1">
            <i className="bi bi-basket2 me-2"></i>
            Donasi Tersedia
            <span className="badge badge-green outfit fs-6 ms-2">{filteredDonations.length}</span>
          </h5>

          {/* Filter */}
          <div className="card p-3 mb-3" style={{backgroundColor: "var(--surface)", borderColor:"var(--border)", boxShadow:"var(--shadow)"}}>
            <div className="row g-2">
              <div className="col-12">
                <input className="form-control input-green" placeholder="🔍 Cari donasi..."
                  value={filter.search}
                  onChange={e => setFilter({ ...filter, search: e.target.value })} />
              </div>
              <div className="col-md-6">
                <select className="form-select input-green" value={filter.category}
                  onChange={e => setFilter({ ...filter, category: e.target.value })}>
                  <option value="">🏷️ Semua Kategori</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.icon_emoji} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <input className="form-control input-green" placeholder="📍 Filter kota..."
                  value={filter.city}
                  onChange={e => setFilter({ ...filter, city: e.target.value })} />
              </div>
              <div className="col-md-4">
                <select className="form-select input-green" value={filter.halal}
                  onChange={e => setFilter({ ...filter, halal: e.target.value })}>
                  <option value="">🍽️ Semua</option>
                  <option value="true">✅ Halal</option>
                  <option value="false">❌ Non Halal</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small text-muted mb-1">⏰ Masih Buka Sampai</label>
                <input type="time" className="form-control form-control-sm input-green"
                  value={filter.pickup_end}
                  onChange={e => setFilter({ ...filter, pickup_end: e.target.value })} />
              </div>
              {(filter.search || filter.category || filter.city || filter.halal ||
                filter.pickup_start || filter.pickup_end) && (
                <div className="col-12">
                  <button className="btn btn-outline-secondary btn-sm"
                    onClick={() => setFilter({
                      category: '', city: '', search: '', halal: '',
                      pickup_start: '', pickup_end: ''
                    })}>
                    <i className="bi bi-x-circle me-1"></i>Reset Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-basket2 display-3 text-green4"></i>
              <p className="text-green4 mt-2">Tidak ada donasi yang sesuai filter</p>
            </div>
          ) : (
            <div className="row g-3">
              {filteredDonations.map(d => (
                <div className="col-md-6" key={d._id}>
                  <div className="card h-100 outfit" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
                    {d.photos?.length > 0 ? (
                      <img src={`/uploads/${d.photos[0].photo_url}`}
                        className="card-img-top" alt={d.title}
                        style={{ height: '150px', objectFit: 'cover' }} />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center"
                        style={{ height: '150px' }}>
                        <i className="bi bi-image display-4 text-muted"></i>
                      </div>
                    )}
                    <div className="card-body d-flex flex-column p-2">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="fw-bold text-green1 mb-0 small">{d.title}</h6>
                        {getStatusBadge(d.status)}
                      </div>
                      <div className="mt-auto">
                        <div className="d-flex flex-wrap gap-1 mb-1">
                          {d.category_id && (
                            <span className="badge bg-light text-dark border" style={{ fontSize: '0.65rem' }}>
                              {d.category_id.icon_emoji} {d.category_id.name}
                            </span>
                          )}
                          {d.is_halal && <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>✅ Halal</span>}
                        </div>
                        <div className="small text-green3 mb-1">
                          <i className="bi bi-box me-1"></i>
                          {d.quantity_remaining}/{d.quantity} {d.quantity_unit}
                        </div>
                        <div className="small text-green3 mb-1">
                          <i className="bi bi-geo-alt me-1"></i>{d.pickup_city}
                        </div>
                        {d.pickup_start_time && (
                          <div className="small text-green3 mb-1">
                            <i className="bi bi-clock me-1"></i>
                            {d.pickup_start_time} - {d.pickup_end_time}
                          </div>
                        )}
                        {/* Jarak */}
                        {userPos && d.pickup_location?.coordinates &&
                          !(d.pickup_location.coordinates[0] === 0) && (
                          <div className="small text-success mb-1">
                            <i className="bi bi-geo me-1"></i>
                            {getDistance(
                              userPos.lat, userPos.lng,
                              d.pickup_location.coordinates[1],
                              d.pickup_location.coordinates[0]
                            ).toFixed(1)} km dari kamu
                          </div>
                        )}
                        <div className="small text-green2 mb-2">
                          <i className="bi bi-person me-1"></i>
                          {d.provider_id?.first_name} {d.provider_id?.last_name}
                          <span className="text-warning ms-1">
                            ★ {d.provider_id?.trust_score?.toFixed(1) || '5.0'}
                          </span>
                        </div>
                        <Link to={`/donations/${d._id}`} className="btn btn-outline-green btn-sm w-100">
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Donations;