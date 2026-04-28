import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '../utils/api';
import { useAuth } from '../Context/AuthContext';

function DonationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Claim form
  const [claimForm, setClaimForm] = useState({ quantity_claimed: 1, pickup_scheduled_at: '', notes: '' });

  // Chat
  const [conversation, setConversation] = useState(null);
  const [chatMsg, setChatMsg] = useState('');

  // Rating
  const [rating, setRating] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [ratingMsg, setRatingMsg] = useState('');
  const [userClaim, setUserClaim] = useState(null);

  const userId = user?.id || user?._id;
  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatDateTime = (date) => new Date(date).toLocaleString('id-ID');

  const fetchDonation = async () => {
    try {
      const res = await api.get(`/donations/${id}`);
      setDonation(res.data);
    } catch { navigate('/donations'); }
    finally { setLoading(false); }
  };

  const fetchClaims = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/claims/donation/${id}`);
      setClaims(res.data);
    } catch {}
  };

  const fetchMyClaim = async () => {
    if (!user) return;
    try {
      const res = await api.get('/claims/my');
      const found = res.data.find(c => c.donation_id?._id === id);
      setUserClaim(found || null);
      if (found?.status === 'completed') {
        const ratingRes = await api.get(`/ratings/check/${found._id}`);
        setHasRated(ratingRes.data.hasRated);
      }
    } catch {}
  };

  const fetchConversation = async () => {
    if (!user || !donation) return;
    try {
      const res = await api.get('/conversations');
      const found = res.data.find(c => c.donation_id?._id === id);
      if (found) setConversation(found);
    } catch {}
  };

  useEffect(() => {
    fetchDonation();
  }, [id]);

  useEffect(() => {
    if (donation) {
      fetchMyClaim();
      fetchClaims();
      fetchConversation();
    }
  }, [donation]);

  const handleClaim = async () => {
    if (!user) return navigate('/login');
    setActionLoading(true);
    try {
      await api.post('/claims', { donation_id: id, ...claimForm });
      setMsg('✅ Donasi berhasil diklaim!');
      fetchDonation();
      fetchMyClaim();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.msg || 'Gagal klaim'));
    } finally { setActionLoading(false); }
  };

  const handleClaimAction = async (claimId, action) => {
    setActionLoading(true);
    try {
      await api.put(`/claims/${claimId}/${action}`);
      setMsg(`✅ Klaim berhasil di-${action}!`);
      fetchClaims();
      fetchDonation();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.msg || 'Gagal'));
    } finally { setActionLoading(false); }
  };

  const handleStartChat = async () => {
    if (!user) return navigate('/login');
    try {
      const receiverId = isProvider ? userClaim?.seeker_id : donation.provider_id._id;
      const res = await api.post('/conversations', {
        donation_id: id,
        receiver_id: receiverId,
      });
      setConversation(res.data);
    } catch {}
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() || !conversation) return;
    try {
      await api.post(`/conversations/${conversation._id}/messages`, { content: chatMsg });
      setChatMsg('');
      const res = await api.get(`/conversations/${conversation._id}`);
      setConversation(res.data);
    } catch {}
  };

  const handleRating = async () => {
    if (rating === 0) return setRatingMsg('⚠️ Pilih bintang dulu!');
    try {
      await api.post('/ratings', { claim_id: userClaim._id, score: rating, review: ratingReview });
      setHasRated(true);
      setRatingMsg('✅ Rating berhasil dikirim!');
    } catch (err) {
      setRatingMsg('❌ ' + (err.response?.data?.msg || 'Gagal kirim rating'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Hapus donasi ini?')) return;
    try {
      await api.delete(`/donations/${id}`);
      navigate('/donations');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.msg || 'Gagal hapus donasi'));
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      available: <span className="badge bg-success fs-6">Tersedia</span>,
      partially_claimed: <span className="badge bg-info fs-6">Sebagian Diklaim</span>,
      fully_claimed: <span className="badge bg-warning text-dark fs-6">Habis Diklaim</span>,
      completed: <span className="badge bg-secondary fs-6">Selesai</span>,
      expired: <span className="badge bg-danger fs-6">Kadaluarsa</span>,
      cancelled: <span className="badge bg-dark fs-6">Dibatalkan</span>,
    };
    return map[status] || <span className="badge bg-secondary fs-6">{status}</span>;
  };

  const getClaimBadge = (status) => {
    const map = {
      pending: <span className="badge bg-warning text-dark">Menunggu</span>,
      confirmed: <span className="badge bg-info">Dikonfirmasi</span>,
      picked_up: <span className="badge bg-primary">Sudah Diambil</span>,
      completed: <span className="badge bg-success">Selesai</span>,
      cancelled: <span className="badge bg-danger">Dibatalkan</span>,
      no_show: <span className="badge bg-dark">Tidak Hadir</span>,
    };
    return map[status] || <span className="badge bg-secondary">{status}</span>;
  };

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  if (!donation) return null;

  const isProvider = userId === donation.provider_id?._id;
  const canClaim = user && !isProvider &&
    ['available', 'partially_claimed'].includes(donation.status) && !userClaim;
  const canChat = user && (isProvider || userClaim) &&
    ['partially_claimed', 'fully_claimed', 'completed'].includes(donation.status);
  const canRate = user && !isProvider && userClaim?.status === 'completed' && !hasRated;

  return (
    <div className="container py-4">
      <p className="position-relative text-green3 mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-1"></i>Kembali
      </p>

      {msg && <div className="alert alert-info" style={{boxShadow:"var(--shadow)"}}>{msg}</div>}

      <div className="row g-4">
        {/* Kiri */}
        <div className="col-md-7">
          {/* Foto */}
          {donation.photos?.length > 0 ? (
            <div id="photoCarousel" className="carousel slide mb-3">
              <div className="carousel-inner rounded">
                {donation.photos.map((p, i) => (
                  <div className={`carousel-item ${i === 0 ? 'active' : ''}`} key={i}>
                    <img src={`/uploads/${p.photo_url}`} className="d-block w-100"
                      alt={donation.title} style={{ height: '300px', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
              {donation.photos.length > 1 && (
                <>
                  <button className="carousel-control-prev" type="button" data-bs-target="#photoCarousel" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon"></span>
                  </button>
                  <button className="carousel-control-next" type="button" data-bs-target="#photoCarousel" data-bs-slide="next">
                    <span className="carousel-control-next-icon"></span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-light rounded d-flex align-items-center justify-content-center mb-3"
              style={{ height: '300px' }}>
              <i className="bi bi-image display-2 text-muted"></i>
            </div>
          )}

          <h2 className="outfit text-green1 fw-bold">{donation.title}</h2>
          <div className="mb-2">{getStatusBadge(donation.status)}</div>
          <p className="text-green3">{donation.description}</p>
          <hr style={{borderColor:"var(--txt)"}}/>

          <div className="row g-2 small  outfit text-green2">
            <div className="col-6">
              <i className="bi bi-tag me-1"></i>
              <strong>Kategori:</strong> {donation.category_id?.icon_emoji} {donation.category_id?.name}
            </div>
            <div className="col-6">
              <i className="bi bi-box me-1"></i>
              <strong>Jumlah:</strong> {donation.quantity_remaining} / {donation.quantity} {donation.quantity_unit} tersisa
            </div>
            <div className="col-6">
              <i className="bi bi-geo-alt me-1"></i>
              <strong>Lokasi:</strong> {donation.pickup_address}, {donation.pickup_city}
            </div>
            <div className="col-6">
              <i className="bi bi-clock me-1"></i>
              <strong>Expired:</strong> {formatDate(donation.expired_at)}
            </div>
            {donation.pickup_start_time && (
              <div className="col-6">
                <i className="bi bi-alarm me-1"></i>
                <strong>Jam Pickup:</strong> {donation.pickup_start_time} - {donation.pickup_end_time}
              </div>
            )}
            {donation.pickup_notes && (
              <div className="col-12">
                <i className="bi bi-info-circle text-primary me-1"></i>
                <strong>Catatan:</strong> {donation.pickup_notes}
              </div>
            )}
            {donation.is_halal !== null && (
              <div className="col-6">
                {donation.is_halal
                  ? <span className="badge bg-success">✅ Halal</span>
                  : <span className="badge bg-secondary">Tidak Berlabel Halal</span>}
              </div>
            )}
            {donation.allergen_notes && (
              <div className="col-12">
                <i className="bi bi-exclamation-triangle text-cream2 me-1"></i>
                <strong>Alergen:</strong> {donation.allergen_notes}
              </div>
            )}
          </div>
        </div>

        {/* Kanan */}
        <div className="col-md-5">
          {/* Info Provider */}
          <div className="card p-3 mb-3 outfit" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
            <h6 className="fw-bold mb-3 text-green1">
              <i className="bi bi-person-circle me-2"></i>Info Provider
            </h6>
            <p className="mb-1 fw-semibold text-green2">
              {donation.provider_id?.first_name} {donation.provider_id?.last_name}
            </p>
            {donation.provider_id?.city && (
              <p className="mb-1 text-green4 small">
                <i className="bi bi-geo me-1"></i>{donation.provider_id.city}
              </p>
            )}
            {donation.provider_id?.phone && (
              <p className="mb-1 text-green3 small">
                <i className="bi bi-telephone me-1"></i>{donation.provider_id.phone}
              </p>
            )}
            <div className="text-cream3">
              {'★'.repeat(Math.round(donation.provider_id?.trust_score || 0))}
              {'☆'.repeat(5 - Math.round(donation.provider_id?.trust_score || 0))}
              <small className="text-green3 ms-1">
                {donation.provider_id?.trust_score?.toFixed(1) || '5.0'} / 5
              </small>
            </div>
          </div>

          {/* Status Klaim User */}
          {userClaim && (
            <div className="card p-3 mb-3" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
              <h6 className="fw-bold text-green1 mb-2">
                <i className="bi bi-receipt me-2"></i>Status Klaim Kamu
              </h6>
              <div className="mb-1">{getClaimBadge(userClaim.status)}</div>
              <small className="text-green3">
                {userClaim.quantity_claimed} {donation.quantity_unit} •
                Diklaim {formatDateTime(userClaim.created_at)}
              </small>
              {userClaim.pickup_scheduled_at && (
                <p className="mb-0 mt-1 text-green2 small">
                  <i className="bi bi-calendar me-1"></i>
                  Jadwal pickup: {formatDateTime(userClaim.pickup_scheduled_at)}
                </p>
              )}
              {['pending', 'confirmed'].includes(userClaim.status) && (
                <button className="btn btn-outline-danger btn-sm mt-2 w-100"
                  onClick={() => handleClaimAction(userClaim._id, 'cancel')}>
                  Batalkan Klaim
                </button>
              )}
            </div>
          )}

          {/* Form Klaim */}
          {canClaim && (
            <div className="card p-3 mb-3 outfit" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
              <h6 className="fw-bold text-green1 mb-3">
                <i className="bi bi-hand-index me-2"></i>Klaim Donasi
              </h6>
              <div className="mb-2">
                <label className="form-label text-green2 small">Jumlah ({donation.quantity_unit})</label>
                <input type="number" className="form-control form-control-sm input-green"
                  min={1} max={donation.quantity_remaining}
                  value={claimForm.quantity_claimed}
                  onChange={e => setClaimForm({ ...claimForm, quantity_claimed: Number(e.target.value) })} />
              </div>
              <div className="mb-2">
                <label className="form-label text-green2 small">Jadwal Pickup (opsional)</label>
                <input type="datetime-local" className="form-control form-control-sm input-green"
                  value={claimForm.pickup_scheduled_at}
                  onChange={e => setClaimForm({ ...claimForm, pickup_scheduled_at: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label small text-green2">Catatan (opsional)</label>
                <textarea className="form-control form-control-sm input-green" rows={2}
                  value={claimForm.notes}
                  onChange={e => setClaimForm({ ...claimForm, notes: e.target.value })} />
              </div>
              <button className="btn btn-green-gradient w-100" onClick={handleClaim} disabled={actionLoading}>
                <i className="bi bi-hand-index me-1"></i>Klaim Sekarang
              </button>
            </div>
          )}

          {/* Manajemen Klaim (Provider) */}
          {isProvider && claims.length > 0 && (
            <div className="card p-3 mb-3 outfit" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
              <h6 className="fw-bold mb-3">
                <i className="bi bi-people text-primary me-2"></i>Daftar Klaim ({claims.length})
              </h6>
              {claims.map(c => (
                <div key={c._id} className="border rounded p-2 mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-0 fw-semibold small">
                        {c.seeker_id?.first_name} {c.seeker_id?.last_name}
                      </p>
                      <small className="text-muted">
                        {c.quantity_claimed} {donation.quantity_unit}
                      </small>
                    </div>
                    {getClaimBadge(c.status)}
                  </div>
                  <div className="d-flex gap-1 mt-2">
                    {c.status === 'pending' && (
                      <button className="btn btn-success btn-sm flex-grow-1"
                        onClick={() => handleClaimAction(c._id, 'confirm')} disabled={actionLoading}>
                        Konfirmasi
                      </button>
                    )}
                    {c.status === 'confirmed' && (
                      <button className="btn btn-primary btn-sm flex-grow-1"
                        onClick={() => handleClaimAction(c._id, 'pickup')} disabled={actionLoading}>
                        Tandai Diambil
                      </button>
                    )}
                    {c.status === 'picked_up' && (
                      <button className="btn btn-success btn-sm flex-grow-1"
                        onClick={() => handleClaimAction(c._id, 'complete')} disabled={actionLoading}>
                        Selesaikan
                      </button>
                    )}
                    {['pending', 'confirmed'].includes(c.status) && (
                      <button className="btn btn-outline-danger btn-sm"
                        onClick={() => handleClaimAction(c._id, 'cancel')} disabled={actionLoading}>
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chat */}
          {canChat && (
            <div className="card p-3 mb-3 outfit" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
              <h6 className="fw-bold text-green1 mb-3">
                <i className="bi bi-chat me-2"></i>Chat
              </h6>
              {!conversation ? (
                <button className="btn btn-outline-primary w-100" onClick={handleStartChat}>
                  <i className="bi bi-chat-dots me-1"></i>Mulai Chat
                </button>
              ) : (
                <>
                  <div className="rounded p-2 mb-2" style={{ height: '200px', overflowY: 'auto', border:"2px solid var(--border)"}}>
                    {conversation.messages?.length === 0 ? (
                      <p className="text-green3 small text-center mt-3">Belum ada pesan</p>
                    ) : conversation.messages?.map(m => {
                      const isMe = m.sender_id === userId || m.sender_id?._id === userId;
                      return (
                        <div key={m._id} className={`mb-2 d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}>
                          <div className={`px-2 py-1 rounded ${isMe ? 'bg-success text-white' : 'bg-light text-success border border-success'}`}
                            style={{ maxWidth: '80%', wordBreak: 'break-word' }}>
                            {m.is_deleted_by_sender
                              ? <em className="text-green3">Pesan dihapus</em>
                              : m.content}
                          </div>
                          <small className="text-green3" style={{ fontSize: '0.7rem' }}>
                            {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                  <form onSubmit={handleSendMessage}>
                    <div className="d-flex gap-2 align-items-end">
                      <textarea
                        className="form-control form-control-sm input-green"
                        placeholder="Tulis pesan... (Shift+Enter untuk baris baru)"
                        value={chatMsg}
                        rows={1}
                        style={{ resize: 'none' }}
                        onChange={e => setChatMsg(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <button className="btn btn-green-gradient btn-sm flex-shrink-0" type="submit">
                        <i className="bi bi-send"></i>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Rating */}
          {canRate && (
            <div className="card outfit p-3" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
              <h6 className="fw-bold mb-3">
                <i className="bi bi-star text-warning me-2"></i>Beri Rating Provider
              </h6>
              {ratingMsg && <div className="alert alert-info py-1 small">{ratingMsg}</div>}
              <div className="d-flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} style={{ fontSize: '1.8rem', cursor: 'pointer' }}
                    onClick={() => setRating(s)}>
                    {s <= rating ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
              <textarea className="form-control form-control-sm mb-2" rows={2}
                placeholder="Tulis review (opsional)..."
                value={ratingReview}
                onChange={e => setRatingReview(e.target.value)} />
              <button className="btn btn-warning btn-sm w-100" onClick={handleRating}>
                <i className="bi bi-send me-1"></i>Kirim Rating
              </button>
            </div>
          )}

          {hasRated && (
            <div className="card outfit p-3" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
              <p className="text-success mb-0">
                <i className="bi bi-check-circle me-1"></i>Kamu sudah memberi rating
              </p>
            </div>
          )}

          {isProvider && ['available', 'expired', 'cancelled'].includes(donation.status) && (
            <div className="card outfit p-3 mt-3" style={{backgroundColor:" var(--surface)", border: "1px solid var(--border)", boxShadow:"var(--shadow)"}}>
              <button className="btn btn-outline-danger w-100" onClick={handleDelete}>
                <i className="bi bi-trash me-1"></i>Hapus Donasi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DonationDetail;