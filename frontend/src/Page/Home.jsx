import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

function Home() {
  const { user } = useAuth();
  const isProvider = user?.role === 'food_provider';

  return (
    <div>
      {/* Hero */}
      <div className="bg-primary text-white py-5">
        <div className="container text-center py-4">
          <i className="bi bi-basket2-fill display-1 mb-3"></i>
          <h1 className="fw-bold display-5">Food Rescue Web</h1>
          <p className="lead mb-4">Platform donasi makanan untuk mengurangi food waste dan membantu sesama</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/donations" className="btn btn-light btn-lg">
              <i className="bi bi-search me-2"></i>Lihat Donasi
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-outline-light btn-lg">
                <i className="bi bi-person-plus me-2"></i>Bergabung Sekarang
              </Link>
            )}
            {user && isProvider && (
              <Link to="/donations/create" className="btn btn-outline-light btn-lg">
                <i className="bi bi-plus-circle me-2"></i>Buat Donasi
              </Link>
            )}
            {user && (
              <Link to="/community" className="btn btn-outline-light btn-lg">
                <i className="bi bi-people me-2"></i>Komunitas
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Cara Kerja */}
      <div className="container py-5">
        <h2 className="text-center fw-bold mb-4">Cara Kerja</h2>
        <div className="row g-4">
          {[
            { icon: 'bi-upload', title: '1. Buat Donasi', desc: 'Food Provider memposting makanan berlebih dengan detail lengkap dan foto' },
            { icon: 'bi-hand-index', title: '2. Klaim Donasi', desc: 'Food Seeker mencari dan mengklaim donasi yang tersedia' },
            { icon: 'bi-check-circle', title: '3. Ambil Makanan', desc: 'Food Seeker mengambil makanan di lokasi yang sudah ditentukan' },
          ].map((item, i) => (
            <div className="col-md-4 text-center" key={i}>
              <div className="card p-4 h-100">
                <i className={`bi ${item.icon} display-4 text-primary mb-3`}></i>
                <h5>{item.title}</h5>
                <p className="text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peran Pengguna */}
      <div className="bg-light py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-4">Peran Pengguna</h2>
          <div className="row g-4 justify-content-center">
            {[
              { icon: 'bi-basket2', title: '🍱 Food Provider', desc: 'Individu atau bisnis yang memiliki kelebihan makanan dan ingin mendonasikannya' },
              { icon: 'bi-people', title: '🤲 Food Seeker', desc: 'Individu atau organisasi yang membutuhkan makanan' },
            ].map((item, i) => (
              <div className="col-md-4" key={i}>
                <div className="card p-4 border-start border-primary border-4 h-100">
                  <h5><i className={`bi ${item.icon} text-primary me-2`}></i>{item.title}</h5>
                  <p className="text-muted mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container py-5">
        <h2 className="text-center fw-bold mb-4">Dampak Kami</h2>
        <div className="row g-4 text-center">
          {[
            { icon: 'bi-basket2-fill', value: '500+', label: 'Donasi Tersalurkan', color: 'primary' },
            { icon: 'bi-people-fill', value: '200+', label: 'Pengguna Aktif', color: 'success' },
            { icon: 'bi-droplet-fill', value: '1.2 Ton', label: 'Makanan Diselamatkan', color: 'warning' },
            { icon: 'bi-globe', value: '10+', label: 'Kota Terjangkau', color: 'info' },
          ].map((s, i) => (
            <div className="col-md-3 col-6" key={i}>
              <div className="card p-4 h-100">
                <i className={`bi ${s.icon} display-5 text-${s.color} mb-2`}></i>
                <h3 className="fw-bold mb-0">{s.value}</h3>
                <small className="text-muted">{s.label}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-dark text-white text-center py-3">
        <small>© 2024 Food Rescue Web - Alamak Agile IFA Sore</small>
      </footer>
    </div>
  );
}

export default Home;