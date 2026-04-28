import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import api from '../utils/api';
import { useAuth } from '../Context/AuthContext';

function History() {
  const { user } = useAuth();
  const [provided, setProvided] = useState([]);
  const [claimed, setClaimed] = useState([]);
  const [tab, setTab] = useState('claimed');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        if (user?.role === 'food_provider') {
          const res = await api.get('/donations/user/history');
          setProvided(res.data.provided || []);
          setTab('provided');
        } else {
          const res = await api.get('/claims/my');
          setClaimed(res.data || []);
          setTab('claimed');
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [user]);

  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const getStatusBadge = (status) => {
    const map = {
      available: <span className="badge bg-success">Tersedia</span>,
      partially_claimed: <span className="badge bg-info">Sebagian Diklaim</span>,
      fully_claimed: <span className="badge bg-warning text-dark">Habis Diklaim</span>,
      completed: <span className="badge bg-secondary">Selesai</span>,
      expired: <span className="badge bg-danger">Kadaluarsa</span>,
      cancelled: <span className="badge bg-dark">Dibatalkan</span>,
      pending: <span className="badge bg-warning text-dark">Menunggu</span>,
      confirmed: <span className="badge bg-info">Dikonfirmasi</span>,
      picked_up: <span className="badge bg-primary">Sudah Diambil</span>,
      no_show: <span className="badge bg-dark">Tidak Hadir</span>,
    };
    return map[status] || <span className="badge bg-secondary">{status}</span>;
  };

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  return (
    <div className="container position-relative outfit py-4">
      <h4 className="syne-h1 text-green1 mb-4">
        <i className="bi bi-clock-history me-2"></i>Riwayat
      </h4>

      {/* Tab — provider bisa lihat keduanya */}
      {user?.role === 'food_provider' && (
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button className={`nav-link ${tab === 'provided' ? 'active text-green1 fw-semibold' : 'text-green3'}`}
              onClick={() => setTab('provided')}>
              🍱 Donasi Saya ({provided.length})
            </button>
          </li>
        </ul>
      )}

      {/* Riwayat Klaim (Seeker) */}
      {tab === 'claimed' && (
        claimed.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox display-3 text-muted"></i>
            <p className="text-green4 mt-2">Belum ada riwayat klaim</p>
            <Link to="/donations" className="btn btn-outline-green mt-2">Cari Donasi</Link>
          </div>
        ) : (
          <div className="row g-3">
            {claimed.map(c => (
              <div className="col-md-6" key={c._id}>
                <div className="card p-3 h-100" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold text-green1 mb-0">
                      {c.donation_id?.category_id?.icon_emoji} {c.donation_id?.title}
                    </h6>
                    {getStatusBadge(c.status)}
                  </div>
                  <p className="text-green3 small mb-1">
                    <i className="bi bi-box me-1"></i>
                    {c.quantity_claimed} {c.donation_id?.quantity_unit}
                  </p>
                  <p className="text-green3 small mb-1">
                    <i className="bi bi-geo-alt me-1"></i>
                    {c.donation_id?.pickup_city}
                  </p>
                  <p className="text-green3 small mb-2">
                    <i className="bi bi-calendar me-1"></i>
                    {formatDate(c.created_at)}
                  </p>

                  {/* Tracking Log */}
                  {c.tracking_log?.length > 0 && (
                    <div className="rounded p-2 mb-2 small" style={{border:"1px solid var(--g1)"}}>
                      <p className="fw-semibold text-green2 mb-1">📋 Tracking:</p>
                      {c.tracking_log.map((log, i) => (
                        <div key={i} className="text-green4">
                          <i className="bi bi-arrow-right me-1"></i>
                          {log.new_status}
                          {log.note && ` — ${log.note}`}
                        </div>
                      ))}
                    </div>
                  )}

                  {c.donation_id?._id && (
                    <Link to={`/donations/${c.donation_id._id}`}
                      className="btn btn-outline-green btn-sm mt-auto">
                      Lihat Donasi
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Riwayat Donasi (Provider) */}
      {tab === 'provided' && (
        provided.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-basket2 display-3 text-green4"></i>
            <p className="text-green4 mt-2">Belum ada donasi</p>
            <Link to="/donations/create" className="btn btn-green-gradient mt-2">Buat Donasi</Link>
          </div>
        ) : (
          <div className="row g-3">
            {provided.map(d => (
              <div className="col-md-6" key={d._id}>
                <div className="card p-3 h-100" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold text-green1 mb-0">
                      {d.category_id?.icon_emoji} {d.title}
                    </h6>
                    {getStatusBadge(d.status)}
                  </div>
                  <p className="text-green3 small mb-1">
                    <i className="bi bi-box me-1"></i>
                    {d.quantity_remaining} / {d.quantity} {d.quantity_unit} tersisa
                  </p>
                  <p className="text-green3 small mb-1">
                    <i className="bi bi-geo-alt me-1"></i>{d.pickup_city}
                  </p>
                  <p className="text-green3 small mb-2">
                    <i className="bi bi-calendar me-1"></i>
                    {formatDate(d.created_at)}
                  </p>
                  <Link to={`/donations/${d._id}`}
                    className="btn btn-outline-green btn-sm mt-auto">
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default History;