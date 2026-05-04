# 🌿 FoodRescue — Platform Donasi Makanan Digital

<div align="center">

**Menghubungkan donatur makanan dengan penerima — lebih cepat, terorganisir, dan berdampak.**

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)

</div>

---

## 🎬 Video Demo

▶️ **[Klik di sini untuk menonton Video Demo FoodRescue](https://mikroskilacid-my.sharepoint.com/:v:/g/personal/pauline_angelicca_students_mikroskil_ac_id/IQBCPdWqmlP0TbGAKgM4qGyoAc65nC66fC8vCb2WI7FYnMc?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=PXmbI1)**

---

## 📋 Daftar Isi

- [Tentang FoodRescue](#-tentang-foodrescue)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Proyek](#-struktur-proyek)
- [Cara Menjalankan](#-cara-menjalankan)
- [Tim Pengembang](#-tim-pengembang)
- [Link](#-link)

---

## 🌍 Tentang FoodRescue

**FoodRescue** adalah platform digital berbasis web yang dirancang untuk mengurangi pemborosan makanan _(food waste)_ di Indonesia. Platform ini menghubungkan **Food Provider** (donatur makanan) dengan **Food Seeker** (penerima donasi) secara langsung, cepat, dan transparan.

> 💡 **Tema: Smart Economy & Smart City** — optimalisasi distribusi sumber daya pangan secara digital untuk ekosistem kota yang lebih berkelanjutan.

---

## ✨ Fitur Utama

### 👤 Manajemen Pengguna

- **Registrasi** akun dengan verifikasi email OTP
- **Login** menggunakan email atau username
- Dua peran pengguna: **Food Provider** (donatur) dan **Food Seeker** (penerima)
- Edit profil dan upload foto avatar
- Sistem **Trust Score** berbasis rating dari komunitas
- **Lupa password** dengan reset via OTP email
- Fitur **Ingat Saya** untuk sesi login persisten

### 🍱 Donasi Makanan _(Food Provider)_

- Buat postingan donasi dengan:
  - Foto makanan hingga **5 foto** (disimpan di Cloudinary)
  - Pilih dari **17+ kategori** makanan
  - Jumlah stok dan satuan
  - Lokasi pickup via **peta interaktif Leaflet**
  - Jam pickup dan batas waktu _(deadline)_
  - Keterangan **halal** dan catatan alergen
- Kelola status donasi: **Tersedia → Sebagian Diklaim → Habis Diklaim → Selesai**
- Lihat daftar klaim masuk, konfirmasi, dan tandai pickup
- Hapus donasi yang sudah tidak aktif

### 🔎 Cari & Klaim Donasi _(Food Seeker)_

- Jelajahi donasi dengan **peta interaktif** + filter radius lokasi berbasis GPS
- Filter berdasarkan kategori, kota, dan label halal
- Klaim donasi dengan jadwal pickup opsional
- Batalkan klaim yang belum dikonfirmasi
- Batas maksimal klaim per donasi per orang

### 🔄 Alur Transaksi Lengkap

- Status klaim real-time: **Pending → Dikonfirmasi → Diambil → Selesai**
- Tracking log setiap perubahan status
- Stok otomatis berkurang saat diklaim dan kembali saat dibatalkan

### 💬 Live Chat Real-time

- Chat langsung antara Provider dan Seeker per donasi
- Pesan terkirim **instan via Socket.io** tanpa perlu refresh halaman
- Indikator **"sedang mengetik..."** real-time
- Status **Online / Offline** lawan bicara
- Optimistic update — pesan tampil sebelum server konfirmasi
- Grouping pesan & date separator bergaya modern

### 🔔 Notifikasi Real-time

- **Toast notification** pop-up otomatis di pojok kanan atas layar
- Notifikasi untuk: donasi diklaim, klaim dikonfirmasi, pesan baru, donasi selesai, klaim dibatalkan
- **Badge unread** di icon Pesan navbar (real-time via socket)
- Riwayat notifikasi tersimpan di database

### 📊 Riwayat & Tracking

- **Food Provider** → Riwayat semua donasi yang pernah dibuat
- **Food Seeker** → Riwayat semua klaim yang pernah dilakukan
- Detail tracking log setiap perubahan status klaim

### ⭐ Sistem Rating

- Seeker memberi rating bintang **1–5** ke Provider setelah donasi selesai
- Trust Score Provider **otomatis diperbarui** setelah rating masuk
- Satu klaim hanya bisa dirating satu kali

### 👥 Komunitas

- Forum diskusi antar pengguna platform
- Buat postingan, tambahkan komentar, dan beri like
- Moderasi konten oleh admin

### 🛠️ Admin Panel

- Dashboard statistik: total user, donasi, klaim, laporan
- Manajemen pengguna: aktifkan / nonaktifkan akun
- Manajemen donasi dan postingan komunitas
- Kelola laporan dari pengguna
- Manajemen kategori makanan (tambah, edit, hapus, seed default)
- Monitor percakapan antar pengguna

### 🎨 UI/UX

- **Dark mode / Light mode** toggle
- Desain **responsif** (PC, tablet, mobile)
- Animasi dan transisi halus

---

## 🛠️ Tech Stack

| Layer         | Teknologi                                                                        |
| ------------- | -------------------------------------------------------------------------------- |
| **Frontend**  | React 19, React Router DOM, Axios, Socket.io Client, Leaflet.js, Bootstrap Icons |
| **Backend**   | Node.js, Express.js, Socket.io                                                   |
| **Database**  | MongoDB Atlas (Mongoose ODM)                                                     |
| **Auth**      | JWT (JSON Web Token), bcryptjs                                                   |
| **Email**     | Nodemailer + Gmail SMTP                                                          |
| **Storage**   | Cloudinary (upload foto)                                                         |
| **Real-time** | Socket.io (chat & notifikasi)                                                    |

---

## 📁 Struktur Proyek

```
FoodRescue/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Donation.js
│   │   ├── Claim.js
│   │   ├── Conversation.js
│   │   ├── Notification.js
│   │   ├── Rating.js
│   │   ├── Report.js
│   │   ├── CommunityPost.js
│   │   ├── FoodCategory.js
│   │   ├── Achievement.js
│   │   └── Otp.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── donations.js
│   │   ├── claims.js
│   │   ├── conversations.js
│   │   ├── notifications.js
│   │   ├── ratings.js
│   │   ├── community.js
│   │   ├── categories.js
│   │   ├── admin.js
│   │   ├── otp.js
│   │   └── contact.js
│   ├── config/
│   │   └── cloudinary.js
│   ├── .env
│   └── server.js
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── assets/logo/
    └── src/
        ├── Component/
        ├── Context/
        ├── Layout/
        ├── Page/
        ├── utils/
        └── Wrapper/
```

---

## 🚀 Cara Menjalankan

### Cara 1 — Clone dari GitHub

```bash
git clone https://github.com/pau236/Alamak_Agile_IFA-Sore.git
cd Alamak_Agile_IFA-Sore
```

### Cara 2 — Download ZIP

📦 **[Download Source Code (ZIP)](https://mikroskilacid-my.sharepoint.com/:u:/g/personal/pauline_angelicca_students_mikroskil_ac_id/IQC1B9l34dIlTKet2JaFZxU2AbZChh6sBkgDVSVPMrNGHu4?e=pgdgwK)**

> File ZIP sudah termasuk `node_modules` dan file `.env` yang sudah terisi lengkap. Jika menggunakan ZIP, langsung loncat ke **Langkah 2**.

---

### Langkah 1 — Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

---

### Langkah 2 — Jalankan Backend

```bash
cd backend
npm run dev
```

Jika berhasil akan muncul:

```
Server running on port 5000
MongoDB Connected!
```

---

### Langkah 3 — Jalankan Frontend

Buka **terminal baru** (jangan tutup terminal backend):

```bash
cd frontend
npm start
```

✅ Browser otomatis membuka `http://localhost:3000`

---

### Menguji Live Chat dengan 2 User

Buka **2 tab browser** di `http://localhost:3000`:

- **Tab 1** → Login sebagai **Food Provider**
- **Tab 2** → Login sebagai **Food Seeker**

Keduanya bisa chat secara real-time tanpa perlu port berbeda.

---

## 👨‍💻 Tim Pengembang

| NIM | Nama |
|---|---|
| 241112931 | Pauline Angelicca G. |
| 241110842 | Everlita Evenlyn |
| 241112170 | John Herbert |
| 241111817 | Jerisco Geraldine |

**Alamak IF-A Sore** — Tugas Kelompok UTS Pengembangan Web Back End 2025/2026
## 🔗 Link

|                          |                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 📁 **Repository GitHub** | [github.com/pau236/Alamak_Agile_IFA-Sore](https://github.com/pau236/Alamak_Agile_IFA-Sore)                                                                                                                                                                                                                                                                               |
| 🎬 **Video Demo**        | [Tonton di sini](https://mikroskilacid-my.sharepoint.com/:v:/g/personal/pauline_angelicca_students_mikroskil_ac_id/IQBCPdWqmlP0TbGAKgM4qGyoAc65nC66fC8vCb2WI7FYnMc?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=PXmbI1) |
| 📦 **Source Code ZIP**   | [Download di sini](https://mikroskilacid-my.sharepoint.com/:u:/g/personal/pauline_angelicca_students_mikroskil_ac_id/IQC1B9l34dIlTKet2JaFZxU2AbZChh6sBkgDVSVPMrNGHu4?e=pgdgwK)                                                                                                                                                                                           |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik.

© 2026 FoodRescue Indonesia. All rights reserved.
