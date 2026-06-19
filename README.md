# Stokira - Aplikasi Manajemen Stok Gudang

Stokira adalah aplikasi web modern, ringan, dan cepat untuk mencatat, memantau, dan mengelola stok gudang secara real-time. Aplikasi ini dirancang khusus untuk admin gudang, staff, dan pemilik usaha agar pencatatan stok barang masuk dan keluar menjadi lebih teratur, aman, dan mudah diaudit.

Fase pengembangan awal ini berjalan dalam **local mode** (menggunakan local API server & `localStorage` di frontend) sebagai prototype matang sebelum nantinya dihubungkan ke production database **Supabase PostgreSQL**.

## 🚀 Fitur Utama

- **Dashboard Real-time**: Ringkasan total barang, total kuantitas stok, indikator stok menipis, barang kosong, serta grafik aktivitas barang masuk & keluar hari ini.
- **Master Data Barang**: Kelola kode barang unik, nama, kategori, unit/satuan, harga beli, harga jual, lokasi rak gudang, dan minimal stok aman.
- **Transaksi Stok Masuk & Keluar**: Catat barang masuk (dari supplier) dan keluar (untuk keperluan servis, instalasi, penjualan, dll.) dengan validasi anti-stok-minus.
- **Riwayat & Audit Pergerakan Stok**: Log lengkap pergerakan kuantitas (`stock_movements`) dengan data "sebelum" dan "sesudah" yang tidak bisa dihapus atau diubah secara langsung.
- **Laporan & Export**: Ringkasan modal nilai stok beli dan export data stok akhir langsung ke format **CSV**.
- **Role-based Access Control**: Simulasi hak akses user (Owner, Admin, Staff) untuk membatasi operasi edit barang dan export data.

## 🛠️ Tech Stack & Arsitektur

- **Frontend**: Vanilla HTML5, CSS3 (Custom properties/variables, grid, flexbox, responsive breakpoints, smooth animations), dan JavaScript modern (SPA dengan hash-routing, no-framework).
- **Backend**: Node.js & Express (REST API endpoint lokal untuk mencatat transaksi dan melakukan backup/restore data).
- **Database Prototype**: File JSON lokal (`data/stokira-db.json`) di backend dan `localStorage` di frontend.

---

## 💻 Cara Menjalankan Secara Lokal

### Prasyarat
- Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di komputer Anda (versi 16 atau lebih baru direkomendasikan).

### Langkah-langkah
1. Clone atau download repositori ini ke komputer Anda.
2. Buka terminal di direktori proyek ini.
3. Jalankan perintah berikut untuk memulai server development backend:
   ```bash
   npm run dev
   ```
4. Server akan berjalan di:
   - URL Backend & Frontend: `http://127.0.0.1:3001`
5. Gunakan salah satu akun demo berikut untuk masuk ke aplikasi (password: `password`):
   - **Owner**: `owner@example.com`
   - **Admin**: `admin@example.com`
   - **Staff**: `staff@example.com`

---

## 📂 Struktur Repositori

```
├── backend/
│   ├── repositories/
│   │   └── local-store.js       # Data layer (JSON database local handler)
│   ├── services/
│   │   └── stock-service.js     # Logika bisnis stok (validasi, movement)
│   ├── seed.js                  # Data awal (seeding) untuk database
│   └── server.js                # Express API server & static file server
├── data/
│   └── stokira-db.json          # File database lokal (gitignored, dibuat otomatis)
├── app.js                       # Logika frontend SPA (routing, events, rendering)
├── styles.css                   # Custom styles, transitions, dan responsive CSS
├── index.html                   # Entry point aplikasi frontend
├── package.json                 # Konfigurasi Node.js & development scripts
├── PRD.md                       # Product Requirements Document
├── PRODUCT.md                   # Strategi desain produk (Impeccable Context)
├── AGENTS.md                    # Panduan kontributor / AI Agent guidelines
└── README.md                    # Dokumentasi utama proyek ini
```

---

## 🤝 Kontribusi

Silakan baca berkas [AGENTS.md](AGENTS.md) untuk mempelajari arsitektur kode, standar gaya penulisan, dan alur commit yang digunakan pada repositori ini.
