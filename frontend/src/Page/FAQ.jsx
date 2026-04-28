import React from "react";
import { useNavigate } from "react-router-dom";

// ─── Data ────────────────────────────────────────────────────────────────────

const heroStatsData = [
  { number: "156", label: "Pertanyaan Dijawab" },
  { number: "4.9★", label: "Rating Helpfulness" },
  { number: "< 24h", label: "Waktu Respons" },
];

const sidebarCategoriesData = [
  { id: "umum", emoji: "🌿", label: "Umum", count: 3 },
  { id: "akun", emoji: "👤", label: "Akun & Profil", count: 5 },
  { id: "donasi", emoji: "🍱", label: "Donasi Makanan", count: 4 },
  { id: "klaim", emoji: "🤝", label: "Klaim & Pengambilan", count: 3 },
  { id: "keamanan", emoji: "🔒", label: "Keamanan & Privasi", count: 3 },
];

const faqGroupsData = [
  {
    id: "umum",
    emoji: "🌿",
    title: "Umum",
    subtitle: "Pertanyaan umum tentang FoodRescue",
    iconBg: "var(--g5)",
    items: [
      {
        question: "Apa itu FoodRescue?",
        tag: { color: "tag-g", label: "🌿 Umum" },
        answer: (
          <>
            FoodRescue adalah platform digital yang menghubungkan orang-orang
            atau bisnis yang memiliki kelebihan makanan dengan mereka yang
            membutuhkan. Tujuan kami adalah mengurangi pemborosan makanan (
            <em>food waste</em>) di Indonesia dengan cara yang mudah, cepat, dan
            transparan.
          </>
        ),
      },
      {
        question: "Apakah FoodRescue gratis untuk digunakan?",
        tag: { color: "tag-g", label: "🌿 Umum" },
        answer: (
          <>
            Ya, <strong>100% gratis</strong> untuk semua pengguna — baik Food
            Provider maupun Food Seeker. Tidak ada biaya langganan, komisi, atau
            biaya tersembunyi. Kami beroperasi dengan misi sosial untuk
            menciptakan dampak nyata bagi masyarakat dan lingkungan.
          </>
        ),
      },
      {
        question: "Bagaimana FoodRescue memastikan keamanan makanan?",
        tag: { color: "tag-g", label: "🌿 Umum" },
        answer: (
          <>
            FoodRescue menerapkan beberapa lapisan keamanan: sistem rating dan
            ulasan pengguna, fitur pelaporan makanan bermasalah, verifikasi
            identitas pengguna, dan batas waktu (<em>expired deadline</em>) yang
            ketat pada setiap postingan. Pengguna yang menerima laporan buruk
            secara konsisten akan ditinjau dan dapat di-<em>suspend</em> oleh
            admin.
          </>
        ),
      },
    ],
  },
  {
    id: "akun",
    emoji: "👤",
    title: "Akun & Profil",
    subtitle: "Registrasi, login, dan pengelolaan akun",
    iconBg: "var(--cr4)",
    items: [
      {
        question: "Apa perbedaan Food Provider dan Food Seeker?",
        tag: { color: "tag-cr", label: "👤 Akun" },
        answer: (
          <>
            <strong>Food Provider</strong> adalah pengguna yang memiliki
            kelebihan makanan dan ingin mendonasikannya. Mereka dapat membuat
            postingan donasi dengan detail makanan, foto, lokasi, dan waktu
            pengambilan.
            <br />
            <br />
            <strong>Food Seeker</strong> adalah pengguna yang mencari donasi
            makanan. Mereka dapat melihat, mencari, dan mengklaim donasi yang
            tersedia di sekitar mereka. Pilih peran saat mendaftar — pastikan
            sesuai kebutuhanmu!
          </>
        ),
      },
      {
        question: "Bagaimana cara mendaftar akun FoodRescue?",
        tag: { color: "tag-cr", label: "👤 Akun" },
        answer: (
          <>
            Pendaftaran sangat mudah:
            <ol style={{ paddingLeft: 18, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>
                Klik tombol "Daftar" di halaman utama
              </li>
              <li style={{ marginBottom: 6 }}>
                Pilih peran: Food Provider atau Food Seeker
              </li>
              <li style={{ marginBottom: 6 }}>
                Isi nama, email, nomor HP, dan kota
              </li>
              <li style={{ marginBottom: 6 }}>Buat password yang kuat</li>
              <li style={{ marginBottom: 6 }}>
                Verifikasi email yang kami kirimkan
              </li>
              <li>Profil siap digunakan!</li>
            </ol>
          </>
        ),
      },
      {
        question:
          "Bisakah saya mengubah peran dari Food Provider ke Food Seeker (atau sebaliknya)?",
        tag: { color: "tag-cr", label: "👤 Akun" },
        answer: (
          <>
            Saat ini perubahan peran tidak dapat dilakukan secara mandiri untuk
            menjaga integritas data dan riwayat aktivitas. Jika kamu perlu
            mengubah peran, silakan hubungi tim support kami di{" "}
            <a href="/kontak">halaman kontak</a> dengan menjelaskan alasannya.
          </>
        ),
      },
      {
        question: "Apa itu Trust Score dan bagaimana cara meningkatkannya?",
        tag: { color: "tag-cr", label: "👤 Akun" },
        answer: (
          <>
            Trust Score adalah nilai kepercayaan (0–5.0) yang mencerminkan
            reputasimu di platform. Skor ini dihitung dari rata-rata rating yang
            diberikan pengguna lain kepadamu setelah transaksi selesai.
            <br />
            <br />
            Cara meningkatkan Trust Score:
            <ul>
              <li>Selalu tepat waktu dalam menyiapkan/mengambil donasi</li>
              <li>
                Pastikan informasi donasi akurat dan makanan dalam kondisi baik
              </li>
              <li>Berkomunikasi aktif melalui chat</li>
              <li>Selesaikan setiap transaksi yang sudah diklaim</li>
            </ul>
          </>
        ),
      },
      {
        question: "Bagaimana cara menghapus akun FoodRescue saya?",
        tag: { color: "tag-sa", label: "⚠️ Penting" },
        answer: (
          <>
            Penghapusan akun bersifat{" "}
            <strong>permanen dan tidak dapat dibatalkan</strong>. Untuk
            menghapus akun, masuk ke <a href="/profile">Profil</a> → Pengaturan
            → Privasi &amp; Keamanan → Hapus Akun. Semua data, riwayat donasi,
            dan poin akan terhapus selamanya. Pertimbangkan baik-baik sebelum
            melanjutkan.
          </>
        ),
      },
    ],
  },
  {
    id: "donasi",
    emoji: "🍱",
    title: "Donasi Makanan",
    subtitle: "Membuat dan mengelola postingan donasi",
    iconBg: "var(--g5)",
    items: [
      {
        question: "Berapa maksimal foto yang bisa diupload untuk satu donasi?",
        tag: { color: "tag-g", label: "🍱 Donasi" },
        answer: (
          <>
            Kamu bisa mengupload maksimal <strong>5 foto</strong> per postingan
            donasi. Format yang didukung: JPG, PNG, dan WebP dengan ukuran
            maksimal 5MB per foto. Disarankan untuk mengupload foto yang jelas
            dan menggambarkan kondisi nyata makanan.
          </>
        ),
      },
      {
        question:
          "Bagaimana cara membatalkan postingan donasi yang sudah dibuat?",
        tag: { color: "tag-g", label: "🍱 Donasi" },
        answer: (
          <>
            Kamu bisa membatalkan donasi yang belum diklaim kapan saja melalui
            halaman Profil → tab Donasi → pilih donasi → klik "Batalkan". Namun
            jika donasi sudah diklaim oleh Food Seeker, pembatalan harus
            dikomunikasikan terlebih dahulu melalui chat dan dapat mempengaruhi
            Trust Score-mu.
          </>
        ),
      },
      {
        question:
          "Apa yang terjadi jika makanan donasi tidak diklaim sampai waktu expired?",
        tag: { color: "tag-sa", label: "⏰ Expired" },
        answer: (
          <>
            Jika donasi tidak diklaim hingga batas waktu expired, status donasi
            akan otomatis berubah menjadi <strong>"Expired"</strong> dan tidak
            lagi tampil di pencarian. Kamu akan mendapat notifikasi 1 jam
            sebelum donasi expired agar bisa mengambil tindakan (memperpanjang
            waktu atau mencari penerima alternatif).
          </>
        ),
      },
      {
        question:
          "Apakah saya bisa mengedit postingan donasi setelah dipublikasikan?",
        tag: { color: "tag-g", label: "🍱 Donasi" },
        answer: (
          <>
            Ya, kamu bisa mengedit beberapa informasi donasi seperti deskripsi,
            pickup notes, dan waktu pengambilan selama status masih "Available".
            Namun <strong>jumlah makanan tidak dapat dikurangi</strong> jika
            sudah ada yang diklaim, dan lokasi tidak dapat diubah setelah ada
            klaim aktif untuk menjaga kepercayaan penerima.
          </>
        ),
      },
    ],
  },
  {
    id: "klaim",
    emoji: "🤝",
    title: "Klaim & Pengambilan",
    subtitle: "Proses klaim dan pengambilan donasi",
    iconBg: "#e8f5ff",
    items: [
      {
        question: "Bagaimana cara mengklaim donasi makanan?",
        tag: { color: "tag-g", label: "🤝 Klaim" },
        answer: (
          <>
            Langkah-langkah mengklaim donasi:
            <ol style={{ paddingLeft: 18, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>
                Cari donasi melalui halaman <a href="/search">Cari</a> atau peta
                interaktif
              </li>
              <li style={{ marginBottom: 6 }}>
                Klik donasi yang diinginkan untuk melihat detail
              </li>
              <li style={{ marginBottom: 6 }}>Klik tombol "Klaim Donasi"</li>
              <li style={{ marginBottom: 6 }}>
                Tentukan jumlah yang ingin diklaim
              </li>
              <li style={{ marginBottom: 6 }}>
                Hubungi Food Provider via chat untuk konfirmasi waktu
                pengambilan
              </li>
              <li>Ambil makanan sesuai jadwal yang disepakati</li>
            </ol>
          </>
        ),
      },
      {
        question:
          "Berapa lama saya punya waktu untuk mengambil makanan setelah mengklaim?",
        tag: { color: "tag-g", label: "🤝 Klaim" },
        answer: (
          <>
            Waktu pengambilan harus disepakati bersama Food Provider melalui
            chat dan harus sebelum waktu expired donasi. Jika kamu tidak
            mengambil makanan sesuai waktu yang disepakati tanpa konfirmasi,
            klaimmu bisa dibatalkan dan statusmu dicatat sebagai{" "}
            <strong>"No Show"</strong> yang dapat mempengaruhi Trust Score.
          </>
        ),
      },
      {
        question: "Bisakah saya membatalkan klaim yang sudah dibuat?",
        tag: { color: "tag-sa", label: "⚠️ Penting" },
        answer: (
          <>
            Kamu bisa membatalkan klaim, namun hal ini perlu dilakukan
            secepatnya agar Food Provider bisa menawarkan donasi ke pengguna
            lain. Pembatalan yang sering dan mendadak akan mempengaruhi Trust
            Score-mu secara negatif. Pastikan kamu hanya mengklaim donasi yang
            benar-benar bisa diambil.
          </>
        ),
      },
    ],
  },
  {
    id: "keamanan",
    emoji: "🔒",
    title: "Keamanan & Privasi",
    subtitle: "Keamanan data dan privasi pengguna",
    iconBg: "var(--sa5)",
    items: [
      {
        question: "Bagaimana FoodRescue melindungi data pribadi saya?",
        tag: { color: "tag-sa", label: "🔒 Keamanan" },
        answer: (
          <>
            Kami mengenkripsi semua data sensitif menggunakan standar industri
            (bcrypt untuk password, HTTPS untuk transmisi data). Data pribadimu
            tidak akan dijual atau dibagikan kepada pihak ketiga tanpa
            persetujuanmu. Baca{" "}
            <a href="/kebijakan-privasi">Kebijakan Privasi</a> lengkap kami
            untuk informasi lebih detail.
          </>
        ),
      },
      {
        question: "Apakah informasi lokasi saya ditampilkan secara publik?",
        tag: { color: "tag-sa", label: "🔒 Keamanan" },
        answer: (
          <>
            Untuk <strong>Food Provider</strong>, alamat pengambilan donasi
            ditampilkan secara umum agar Food Seeker bisa menemukannya. Namun
            koordinat GPS yang tepat hanya ditampilkan dalam radius pencarian,
            bukan alamat lengkap. Untuk <strong>Food Seeker</strong>, lokasi
            kamu bersifat privat dan hanya digunakan untuk menghitung jarak ke
            donasi terdekat.
          </>
        ),
      },
      {
        question:
          "Bagaimana melaporkan pengguna atau konten yang mencurigakan?",
        tag: { color: "tag-sa", label: "🚩 Laporan" },
        answer: (
          <>
            Kamu bisa melaporkan konten atau pengguna mencurigakan dengan cara:
            <ul>
              <li>
                Klik ikon "⚑ Laporkan" pada postingan donasi atau profil
                pengguna
              </li>
              <li>
                Pilih kategori laporan (makanan basi, info tidak akurat,
                penipuan, dll.)
              </li>
              <li>Tambahkan deskripsi tambahan jika diperlukan</li>
            </ul>
            Tim admin akan meninjau laporan dalam waktu 24 jam dan mengambil
            tindakan sesuai kebijakan platform.
          </>
        ),
      },
    ],
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

/**
 * FaqHero
 * Bagian atas halaman dengan judul, deskripsi, search bar, dan quick filter.
 */
class FaqHero extends React.Component {
  render() {
    const { searchQuery, onSearchChange, activeCategory, onCategoryChange } =
      this.props;

    return (
      <section className="faq-hero">
        {/* Grid dekoratif di background */}
        <div className="faq-hero__grid" />

        <div className="container-md faq-hero__inner px-4 px-md-5">
          <div className="row g-5 align-items-center">
            {/* Teks + search bar */}
            <div className="col-12 col-md-7">
              <div className="faq-hero__badge mb-3">
                <i className="bi bi-patch-question-fill" />
                <span>Pusat Bantuan</span>
              </div>

              <h1 className="syne-h1 faq-hero__title">
                Ada yang Bisa
                <br />
                <span>Kami Bantu?</span>
              </h1>

              <p className="faq-hero__desc">
                Temukan jawaban atas pertanyaanmu tentang FoodRescue — mulai
                dari cara daftar, membuat donasi, hingga keamanan akun.
              </p>

              {/* Search bar */}
              <div className="faq-search-box">
                <i className="bi bi-search faq-search-box__icon" />
                <input
                  type="text"
                  className="faq-search-box__input"
                  placeholder="Cari pertanyaan... (contoh: cara klaim, hapus akun)"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="faq-search-box__clear"
                    onClick={() => onSearchChange("")}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                )}
              </div>

              {/* Quick filter topics */}
              <div className="faq-quick-topics mt-3">
                <button
                  className={`faq-topic-btn${activeCategory === "semua" ? " faq-topic-btn--active" : ""}`}
                  onClick={() => onCategoryChange("semua")}
                >
                  Semua
                </button>
                {sidebarCategoriesData.map((cat) => (
                  <button
                    key={cat.id}
                    className={`faq-topic-btn${activeCategory === cat.id ? " faq-topic-btn--active" : ""}`}
                    onClick={() => onCategoryChange(cat.id)}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats box */}
            <div className="col-12 col-md-5">
              <div className="faq-hero__stat-box">
                <div className="faq-hero__stat-box-title">
                  📊 Statistik Bantuan
                </div>
                {heroStatsData.map((stat) => (
                  <div key={stat.label} className="faq-hero__stat-item">
                    <div className="faq-hero__stat-num">{stat.number}</div>
                    <div className="faq-hero__stat-lbl">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

/**
 * FaqSidebar
 * Navigasi kategori di sebelah kiri (hanya tampil di desktop).
 */
class FaqSidebar extends React.Component {
  render() {
    const { activeCategory, onCategoryChange } = this.props;

    return (
      <aside className="faq-sidebar d-none d-md-block">
        <div className="faq-sidebar__title">Kategori</div>

        {/* Semua */}
        <button
          className={`faq-sidebar__link${activeCategory === "semua" ? " faq-sidebar__link--active" : ""}`}
          onClick={() => onCategoryChange("semua")}
        >
          <span className="faq-sidebar__icon">📋</span>
          <span>Semua Pertanyaan</span>
          <span className="faq-sidebar__count">
            {faqGroupsData.reduce((sum, g) => sum + g.items.length, 0)}
          </span>
        </button>

        {sidebarCategoriesData.map((cat) => (
          <button
            key={cat.id}
            className={`faq-sidebar__link${activeCategory === cat.id ? " faq-sidebar__link--active" : ""}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            <span className="faq-sidebar__icon">{cat.emoji}</span>
            <span>{cat.label}</span>
            <span className="faq-sidebar__count">{cat.count}</span>
          </button>
        ))}
      </aside>
    );
  }
}

/**
 * FaqItem
 * Satu item pertanyaan + jawaban dalam bentuk accordion.
 */
class FaqItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState((prev) => ({ isOpen: !prev.isOpen }));
  }

  render() {
    const { question, answer, tag } = this.props;
    const { isOpen } = this.state;

    return (
      <div className={`faq-item${isOpen ? " faq-item--open" : ""}`}>
        {/* Baris pertanyaan */}
        <div className="faq-item__question" onClick={this.toggle}>
          <span className="faq-item__question-text">{question}</span>
          <div
            className={`faq-item__chevron${isOpen ? " faq-item__chevron--open" : ""}`}
          >
            <i className="bi bi-chevron-down" />
          </div>
        </div>

        {/* Jawaban yang bisa dibuka/tutup */}
        <div
          className={`faq-item__answer${isOpen ? " faq-item__answer--open" : ""}`}
        >
          <div className="faq-item__answer-inner">
            <span className={`faq-tag ${tag.color}`}>{tag.label}</span>
            <br />
            {answer}
          </div>
        </div>
      </div>
    );
  }
}

/**
 * FaqGroup
 * Satu kelompok pertanyaan berdasarkan kategori.
 */
class FaqGroup extends React.Component {
  render() {
    const { emoji, title, subtitle, iconBg, items } = this.props;

    return (
      <div className="faq-group">
        {/* Header kategori */}
        <div className="faq-group__header">
          <div className="faq-group__icon" style={{ background: iconBg }}>
            {emoji}
          </div>
          <div>
            <div className="faq-group__title syne-h1">{title}</div>
            <div className="faq-group__subtitle">{subtitle}</div>
          </div>
        </div>

        {/* Daftar pertanyaan */}
        {items.map((item, index) => (
          <FaqItem
            key={index}
            question={item.question}
            answer={item.answer}
            tag={item.tag}
          />
        ))}
      </div>
    );
  }
}

/**
 * FaqHelpBox
 * Kotak CTA di bagian bawah — ajakan hubungi tim jika belum ketemu jawaban.
 */
class FaqHelpBox extends React.Component {
  render() {
    const navigate = this.props.navigate;

    return (
      <div className="faq-help-box">
        <div className="faq-help-box__title">Masih Butuh Bantuan? 🙋</div>
        <div className="faq-help-box__subtitle">
          Tidak menemukan jawaban yang kamu cari? Tim kami siap membantu dengan
          senang hati.
        </div>
        <div className="faq-help-box__buttons">
          <button
            onClick={() => navigate("/contact")}
            className="faq-help-box__btn-primary"
          >
            <i className="bi bi-envelope-fill" /> Hubungi Kami
          </button>
          <button
            onClick={() => navigate("/community")}
            className="faq-help-box__btn-secondary"
          >
            <i className="bi bi-people-fill" /> Forum Komunitas
          </button>
        </div>
      </div>
    );
  }
}

/**
 * FaqContent
 * Area konten utama: sidebar + daftar grup FAQ.
 * Mengelola state search query dan kategori aktif.
 */
class FaqContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      activeCategory: "semua",
    };
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.faqRef = React.createRef();
  }

  handleSearchChange(value) {
    this.setState({ searchQuery: value, activeCategory: "semua" });
  }

  handleCategoryChange(categoryId) {
    this.setState({ activeCategory: categoryId, searchQuery: "" }, () => {
      this.faqRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  /** Filter grup FAQ berdasarkan pencarian atau kategori yang dipilih */
  getFilteredGroups() {
    const { searchQuery, activeCategory } = this.state;
    const query = searchQuery.toLowerCase().trim();

    return faqGroupsData
      .filter(
        (group) => activeCategory === "semua" || group.id === activeCategory,
      )
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => query === "" || item.question.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }

  render() {
    const { navigate } = this.props;
    const { searchQuery, activeCategory } = this.state;
    const filteredGroups = this.getFilteredGroups();

    return (
      <>
        {/* Hero dengan search & filter */}
        <FaqHero
          searchQuery={searchQuery}
          onSearchChange={this.handleSearchChange}
          activeCategory={activeCategory}
          onCategoryChange={this.handleCategoryChange}
        />

        {/* Layout dua kolom: sidebar kiri + konten kanan */}
        <div className="container-md px-4 px-md-5">
          <div className="faq-layout">
            {/* Sidebar navigasi kategori */}
            <FaqSidebar
              activeCategory={activeCategory}
              onCategoryChange={this.handleCategoryChange}
            />

            {/* Konten FAQ */}
            <div className="faq-main" ref={this.faqRef}>
              {/* Pesan jika tidak ada hasil pencarian */}
              {filteredGroups.length === 0 ? (
                <div className="faq-empty">
                  <div className="faq-empty__emoji">🔍</div>
                  <div className="faq-empty__title syne-h1">
                    Tidak Ada Hasil
                  </div>
                  <p className="faq-empty__desc">
                    Tidak ada pertanyaan yang cocok dengan{" "}
                    <strong>"{searchQuery}"</strong>. Coba kata kunci lain atau
                    hubungi kami langsung.
                  </p>
                  <button
                    className="btn-green-gradient px-4 py-2 rounded-3"
                    onClick={() => this.handleSearchChange("")}
                  >
                    Tampilkan Semua
                  </button>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <FaqGroup
                    key={group.id}
                    emoji={group.emoji}
                    title={group.title}
                    subtitle={group.subtitle}
                    iconBg={group.iconBg}
                    items={group.items}
                  />
                ))
              )}

              {/* Kotak bantuan tambahan */}
              <FaqHelpBox navigate={navigate} />
            </div>
          </div>
        </div>
      </>
    );
  }
}

// ─── Wrapper untuk useNavigate (hanya function component yang bisa pakai hook) ─

const FaqContentWithNavigate = () => {
  const navigate = useNavigate();
  return <FaqContent navigate={navigate} />;
};

// ─── Root component ───────────────────────────────────────────────────────────

class FAQ extends React.Component {
  render() {
    return (
      <div className="main-bg-color">
        <FaqContentWithNavigate />
      </div>
    );
  }
}

export default FAQ;
