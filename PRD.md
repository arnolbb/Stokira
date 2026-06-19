# PRD - Stokira: Aplikasi Stok Gudang

## 1. Ringkasan Produk

### 1.1 Nama Produk

**Stokira**

Nama ini bersifat sementara dan bisa diganti sesuai brand final.

### 1.2 Deskripsi Singkat

Stokira adalah aplikasi web untuk mencatat, memantau, dan mengelola stok gudang. Aplikasi ini membantu admin gudang mencatat barang masuk, barang keluar, memantau stok real-time, melihat barang yang hampir habis, serta membuat laporan stok.

Untuk arah final, Stokira akan menggunakan **Supabase PostgreSQL** sebagai database utama. Namun pada fase desain dan pengembangan awal, aplikasi akan berjalan dengan **mode lokal** terlebih dahulu agar UI, alur kerja, validasi, dan pengalaman pengguna bisa dimatangkan sebelum migrasi ke Supabase.

### 1.3 Tujuan Utama

Membuat aplikasi stok gudang yang sederhana, mudah digunakan, cepat dibangun, dan siap berkembang. Sistem harus memungkinkan pengguna mengelola stok barang dengan akurat, menjaga riwayat perubahan stok, dan mudah dipindahkan dari database lokal ke Supabase/PostgreSQL.

### 1.4 Target Pengguna

- Admin gudang
- Staff gudang
- Pemilik usaha kecil/menengah
- Distributor produk
- Tim operasional
- Tim teknisi yang mengambil barang dari gudang

### 1.5 Masalah yang Ingin Diselesaikan

- Stok sering tidak cocok karena pencatatan manual tidak rapi
- Sulit melacak barang masuk dan keluar
- Tidak ada riwayat perubahan stok yang jelas
- Barang habis tanpa diketahui sebelumnya
- Laporan bulanan dibuat manual
- Kesalahan input bisa mengubah data penting
- Sulit mengetahui siapa yang mengambil barang dan untuk keperluan apa

Stokira menjadi layer aplikasi yang lebih aman dan rapi dibanding pencatatan spreadsheet langsung.

---

## 2. Strategi Database

### 2.1 Arah Final: Supabase PostgreSQL

Database final menggunakan Supabase PostgreSQL.

Alasan pemilihan:

- Struktur data stok gudang bersifat relasional
- Mendukung constraint, foreign key, index, dan transaksi database
- Lebih aman untuk stok dibanding Google Sheets
- Mudah backup dan restore dengan `pg_dump` / `psql`
- Mudah migrasi ke server PostgreSQL lain jika aplikasi berkembang
- Supabase juga menyediakan Auth, dashboard database, dan API bawaan

### 2.2 Fase Awal: Local Mode

Pada fase desain awal, aplikasi berjalan dengan mode lokal terlebih dahulu.

Tujuan local mode:

- Mematangkan UI/UX sebelum koneksi Supabase
- Menguji alur stok masuk/keluar tanpa dependensi cloud
- Mempercepat iterasi desain
- Memastikan struktur data dan service layer siap dimigrasikan

Implementasi local mode disarankan menggunakan salah satu opsi berikut:

1. **Local SQLite** untuk prototype fungsional.
2. **Local JSON/mock repository** untuk prototype UI cepat.
3. **Local Supabase/Postgres via Docker** jika ingin schema paling dekat dengan production.

Rekomendasi terbaik:

```text
Development awal: local repository/mock atau SQLite
Final MVP: Supabase PostgreSQL
```

### 2.3 Prinsip Agar Mudah Migrasi

UI tidak boleh langsung bergantung pada detail database lokal atau Supabase. Semua akses data wajib lewat service/repository layer.

Contoh struktur:

```text
/lib/repositories/products.ts
/lib/repositories/stock-in.ts
/lib/repositories/stock-out.ts
/lib/repositories/movements.ts
/lib/repositories/reports.ts
```

Pada fase lokal:

```text
UI -> service -> local repository
```

Pada fase Supabase:

```text
UI -> service -> supabase repository
```

Dengan pola ini, migrasi ke Supabase cukup mengganti implementasi repository, bukan membangun ulang halaman.

---

## 3. Ruang Lingkup Produk

### 3.1 Versi MVP

Versi MVP berfokus pada fitur inti berikut:

1. Login pengguna
2. Dashboard stok
3. Manajemen data barang
4. Barang masuk
5. Barang keluar
6. Riwayat pergerakan stok
7. Stok menipis
8. Laporan sederhana
9. Export data ke Excel/CSV
10. Supabase PostgreSQL sebagai database final
11. Local mode untuk fase desain dan pengembangan awal

### 3.2 Di Luar Scope MVP

- Barcode scanner
- QR code otomatis
- Multi gudang
- Approval bertingkat
- Notifikasi WhatsApp/email
- Mobile app native
- AI prediksi stok
- Integrasi marketplace
- Integrasi accounting
- Sistem purchase order

---

## 4. Prinsip Produk

### 4.1 Simple First

Aplikasi harus mudah digunakan oleh orang non-teknis.

### 4.2 Local First, Supabase Ready

Pengembangan awal boleh memakai local mode, tetapi struktur kode dan data harus disiapkan agar mudah dipindah ke Supabase PostgreSQL.

### 4.3 Data Tidak Boleh Mudah Rusak

User tidak boleh mengubah stok langsung tanpa riwayat. Semua perubahan stok harus melalui transaksi atau penyesuaian.

### 4.4 Semua Perubahan Stok Harus Tercatat

Setiap perubahan stok wajib masuk ke `stock_movements`.

### 4.5 Validasi Ketat

Aplikasi harus mencegah stok minus, input kosong, jumlah tidak valid, produk tidak ditemukan, dan transaksi yang tidak lengkap.

---

## 5. Persona Pengguna

### 5.1 Owner / Pemilik Usaha

Kebutuhan:

- Melihat kondisi stok secara cepat
- Mengetahui barang yang hampir habis
- Mengecek laporan stok bulanan
- Memantau penggunaan barang oleh staff atau teknisi

Hak akses:

- Full access
- Bisa melihat laporan
- Bisa export data
- Bisa melihat semua transaksi

### 5.2 Admin Gudang

Kebutuhan:

- Input barang masuk
- Input barang keluar
- Tambah dan edit data barang
- Mengecek stok harian
- Melihat riwayat transaksi

Hak akses:

- Full access terhadap operasional stok
- Bisa edit data barang
- Bisa input transaksi

### 5.3 Staff Gudang

Kebutuhan:

- Melihat stok
- Input barang masuk
- Input barang keluar

Hak akses:

- Bisa input transaksi
- Bisa melihat stok
- Tidak bisa menghapus data
- Tidak bisa mengubah pengaturan sistem

### 5.4 Teknisi / Pengambil Barang

Kebutuhan:

- Mengambil barang untuk pekerjaan
- Dicatat sebagai penerima barang

Hak akses:

- Tidak wajib punya akun di MVP
- Bisa masuk sebagai data penerima pada transaksi barang keluar

---

## 6. User Stories dan Acceptance Criteria

### 6.1 Dashboard

Sebagai admin, saya ingin melihat ringkasan stok agar saya tahu kondisi gudang tanpa membuka laporan manual.

Acceptance criteria:

- Sistem menampilkan total barang aktif
- Sistem menampilkan total quantity stok
- Sistem menampilkan jumlah barang dengan stok menipis
- Sistem menampilkan jumlah barang kosong
- Sistem menampilkan barang masuk hari ini
- Sistem menampilkan barang keluar hari ini
- Sistem menampilkan transaksi terbaru
- Sistem menampilkan daftar barang yang perlu restock

### 6.2 Data Barang

Sebagai admin, saya ingin menambahkan data barang agar barang tersebut bisa dikelola stoknya.

Acceptance criteria:

- Admin bisa menambah barang baru
- Admin bisa mengedit data barang
- Admin bisa menonaktifkan barang
- Sistem membuat atau memvalidasi kode barang unik
- Stok awal bisa diisi saat membuat barang
- Jika stok awal diisi, sistem mencatatnya sebagai movement `INITIAL`

### 6.3 Barang Masuk

Sebagai staff gudang, saya ingin mencatat barang masuk agar stok bertambah otomatis.

Acceptance criteria:

- User bisa memilih barang aktif
- User bisa mengisi jumlah masuk
- User bisa mengisi supplier
- User bisa mengisi nomor invoice/surat jalan
- Stok produk bertambah setelah transaksi disimpan
- Transaksi tercatat di `stock_in`
- Riwayat tercatat di `stock_movements`

### 6.4 Barang Keluar

Sebagai staff gudang, saya ingin mencatat barang keluar agar stok berkurang otomatis.

Acceptance criteria:

- User bisa memilih barang aktif
- User bisa mengisi jumlah keluar
- User bisa mengisi penerima
- User bisa memilih keperluan barang keluar
- Sistem mencegah stok menjadi minus
- Stok produk berkurang setelah transaksi disimpan
- Transaksi tercatat di `stock_out`
- Riwayat tercatat di `stock_movements`

### 6.5 Riwayat Stok

Sebagai owner, saya ingin melihat riwayat semua perubahan stok agar saya bisa melakukan audit jika terjadi selisih.

Acceptance criteria:

- Semua perubahan stok muncul di halaman riwayat
- Riwayat bisa difilter berdasarkan tanggal
- Riwayat bisa difilter berdasarkan barang
- Riwayat bisa difilter berdasarkan tipe transaksi
- Riwayat menampilkan stok sebelum dan stok sesudah

### 6.6 Stok Menipis

Sebagai admin, saya ingin melihat barang yang stoknya di bawah minimal agar saya tahu barang mana yang perlu restock.

Acceptance criteria:

- Sistem membandingkan `stock` dengan `min_stock`
- Barang dengan stok kurang dari atau sama dengan minimal stok masuk daftar stok menipis
- Barang dengan stok 0 diberi status kosong
- Halaman menampilkan rekomendasi restock sederhana

### 6.7 Laporan

Sebagai owner, saya ingin melihat laporan stok agar saya bisa memantau aktivitas gudang.

Acceptance criteria:

- User bisa memilih rentang tanggal
- User bisa melihat laporan barang masuk
- User bisa melihat laporan barang keluar
- User bisa melihat laporan stok akhir
- User bisa export laporan ke CSV atau Excel

---

## 7. Struktur Halaman

### 7.1 `/login`

Halaman login untuk owner, admin, dan staff.

Komponen:

- Input email/username
- Input password
- Tombol login
- Pesan error jika login gagal

### 7.2 `/dashboard`

Komponen:

- Card total barang
- Card total stok
- Card barang menipis
- Card barang kosong
- Card barang masuk hari ini
- Card barang keluar hari ini
- Tabel barang perlu restock
- Tabel transaksi terbaru

### 7.3 `/barang`

Komponen:

- Search barang
- Filter kategori
- Filter status stok
- Tabel barang
- Tombol tambah barang
- Tombol edit
- Tombol nonaktifkan

Kolom tabel:

- Kode barang
- Nama barang
- Kategori
- Satuan
- Stok
- Minimal stok
- Lokasi
- Status
- Aksi

### 7.4 `/barang/tambah`

Field:

- Kode barang
- Nama barang
- Kategori
- Satuan
- Lokasi
- Stok awal
- Minimal stok
- Harga beli
- Harga jual
- Catatan
- Status aktif

### 7.5 `/barang/edit/:id`

Field sama seperti tambah barang, tetapi stok tidak boleh diedit langsung. Perubahan stok harus melalui transaksi masuk/keluar atau penyesuaian stok.

### 7.6 `/stok-masuk`

Field:

- Tanggal
- Produk
- Jumlah
- Supplier
- Nomor invoice/surat jalan
- Catatan

### 7.7 `/stok-keluar`

Field:

- Tanggal
- Produk
- Jumlah
- Penerima
- Keperluan
- Nomor referensi
- Catatan

Pilihan keperluan:

- Penjualan
- Instalasi
- Maintenance
- Retur ke supplier
- Rusak
- Sampel
- Pemakaian internal
- Lainnya

### 7.8 `/riwayat-stok`

Filter:

- Rentang tanggal
- Produk
- Kategori
- Tipe transaksi
- User pembuat transaksi

Kolom:

- Tanggal
- Kode barang
- Nama barang
- Tipe
- Jumlah
- Stok sebelum
- Stok sesudah
- Dibuat oleh
- Catatan

### 7.9 `/stok-menipis`

Kolom:

- Kode barang
- Nama barang
- Stok saat ini
- Minimal stok
- Selisih
- Status
- Lokasi
- Tombol tambah stok

### 7.10 `/laporan`

Jenis laporan:

- Barang masuk
- Barang keluar
- Stok akhir
- Pergerakan stok
- Barang menipis

Fitur:

- Filter tanggal
- Filter kategori
- Export CSV
- Export Excel

### 7.11 `/pengguna`

MVP boleh sederhana.

Field:

- Nama
- Email
- Role
- Status aktif

### 7.12 `/pengaturan`

Pengaturan:

- Nama aplikasi
- Nama bisnis
- Mode database: local / supabase
- Supabase URL
- Supabase project reference
- Timezone
- Currency
- Format tanggal

---

## 8. Struktur Database Supabase/PostgreSQL

### 8.1 `products`

| Field | Type | Required | Description |
|---|---|---|---|
| id | uuid/text | Ya | ID unik produk |
| code | text | Ya | Kode barang unik |
| name | text | Ya | Nama barang |
| category_id | uuid/text | Tidak | Relasi kategori |
| unit | text | Ya | Unit/satuan |
| stock | integer/numeric | Ya | Stok saat ini |
| min_stock | integer/numeric | Ya | Batas minimal stok |
| location | text | Tidak | Lokasi rak/gudang |
| purchase_price | numeric | Tidak | Harga beli |
| selling_price | numeric | Tidak | Harga jual |
| notes | text | Tidak | Catatan produk |
| status | text | Ya | active / inactive |
| created_at | timestamptz | Ya | Tanggal dibuat |
| updated_at | timestamptz | Ya | Tanggal update |

Constraint:

- `code` unique
- `stock >= 0`
- `min_stock >= 0`
- `status in ('active', 'inactive')`

### 8.2 `categories`

| Field | Type | Required | Description |
|---|---|---|---|
| id | uuid/text | Ya | ID kategori |
| name | text | Ya | Nama kategori |
| description | text | Tidak | Deskripsi |
| status | text | Ya | active / inactive |
| created_at | timestamptz | Ya | Tanggal dibuat |

### 8.3 `suppliers`

| Field | Type | Required | Description |
|---|---|---|---|
| id | uuid/text | Ya | ID supplier |
| name | text | Ya | Nama supplier |
| contact | text | Tidak | Nomor HP/email |
| address | text | Tidak | Alamat supplier |
| notes | text | Tidak | Catatan |
| status | text | Ya | active / inactive |
| created_at | timestamptz | Ya | Tanggal dibuat |

### 8.4 `stock_in`

| Field | Type | Required | Description |
|---|---|---|---|
| id | uuid/text | Ya | ID transaksi masuk |
| transaction_date | date/timestamptz | Ya | Tanggal barang masuk |
| product_id | uuid/text | Ya | ID produk |
| product_code | text | Ya | Snapshot kode barang |
| product_name | text | Ya | Snapshot nama barang |
| quantity | integer/numeric | Ya | Jumlah masuk |
| supplier_name | text | Tidak | Nama supplier |
| invoice_number | text | Tidak | Nomor invoice/surat jalan |
| notes | text | Tidak | Catatan transaksi |
| created_by | uuid/text | Ya | User pembuat |
| created_at | timestamptz | Ya | Waktu dibuat |

### 8.5 `stock_out`

| Field | Type | Required | Description |
|---|---|---|---|
| id | uuid/text | Ya | ID transaksi keluar |
| transaction_date | date/timestamptz | Ya | Tanggal barang keluar |
| product_id | uuid/text | Ya | ID produk |
| product_code | text | Ya | Snapshot kode barang |
| product_name | text | Ya | Snapshot nama barang |
| quantity | integer/numeric | Ya | Jumlah keluar |
| recipient | text | Tidak | Penerima barang |
| purpose | text | Ya | Tujuan barang keluar |
| reference_number | text | Tidak | Nomor referensi |
| notes | text | Tidak | Catatan transaksi |
| created_by | uuid/text | Ya | User pembuat |
| created_at | timestamptz | Ya | Waktu dibuat |

### 8.6 `stock_movements`

| Field | Type | Required | Description |
|---|---|---|---|
| id | uuid/text | Ya | ID movement |
| movement_date | date/timestamptz | Ya | Tanggal movement |
| product_id | uuid/text | Ya | ID produk |
| product_code | text | Ya | Snapshot kode barang |
| product_name | text | Ya | Snapshot nama barang |
| type | text | Ya | IN / OUT / ADJUSTMENT / INITIAL |
| quantity | integer/numeric | Ya | Jumlah perubahan |
| stock_before | integer/numeric | Ya | Stok sebelum transaksi |
| stock_after | integer/numeric | Ya | Stok setelah transaksi |
| ref_id | uuid/text | Tidak | ID transaksi sumber |
| ref_type | text | Tidak | stock_in / stock_out / adjustment |
| notes | text | Tidak | Catatan |
| created_by | uuid/text | Ya | User pembuat |
| created_at | timestamptz | Ya | Waktu dibuat |

### 8.7 `users` / Supabase Auth

Untuk versi final, user login disarankan memakai **Supabase Auth**.

Jika local mode belum memakai Supabase Auth, gunakan seed user lokal:

- owner@example.com
- admin@example.com
- staff@example.com

Data profil aplikasi dapat disimpan di tabel `profiles`.

| Field | Type | Required | Description |
|---|---|---|---|
| id | uuid/text | Ya | ID user, mengikuti auth user id |
| name | text | Ya | Nama user |
| email | text | Ya | Email |
| role | text | Ya | owner / admin / staff |
| status | text | Ya | active / inactive |
| created_at | timestamptz | Ya | Tanggal dibuat |
| last_login | timestamptz | Tidak | Login terakhir |

### 8.8 `settings`

| Field | Type | Required | Description |
|---|---|---|---|
| key | text | Ya | Key pengaturan |
| value | text/jsonb | Ya | Nilai pengaturan |
| description | text | Tidak | Deskripsi |

---

## 9. Aturan Bisnis

### 9.1 Kode Barang Harus Unik

Tidak boleh ada dua barang dengan `code` yang sama.

### 9.2 Stok Tidak Boleh Minus

Saat barang keluar, sistem harus mengecek stok tersedia.

Contoh:

```text
Stok tersedia: 5
User input keluar: 7
Sistem menolak transaksi
Pesan: "Stok tidak mencukupi. Stok tersedia hanya 5."
```

### 9.3 Stok Hanya Berubah Melalui Transaksi

Field `products.stock` tidak boleh diubah langsung dari UI. Semua perubahan stok harus melalui:

- Barang masuk
- Barang keluar
- Penyesuaian stok
- Initial stock saat barang dibuat

### 9.4 Snapshot Nama Barang

Saat transaksi dibuat, sistem menyimpan snapshot `product_code` dan `product_name`.

### 9.5 Barang Nonaktif

Barang yang sudah tidak digunakan tidak dihapus. Status diubah menjadi `inactive`.

### 9.6 Minimal Stok

Barang dianggap menipis jika:

```text
stock <= min_stock
```

Barang dianggap kosong jika:

```text
stock == 0
```

### 9.7 Transaksi Tidak Boleh Dihapus

Untuk menjaga audit trail, transaksi tidak dihapus permanen. Jika ada kesalahan, buat transaksi penyesuaian atau fitur void/cancel pada versi lanjutan.

### 9.8 Timezone

Default timezone:

```text
Asia/Jakarta
```

---

## 10. Alur Sistem

### 10.1 Alur Tambah Barang Baru

```text
User buka halaman Data Barang
Klik Tambah Barang
Isi data barang
Sistem validasi kode barang unik
Sistem simpan data ke products
Jika stok awal > 0, sistem buat movement tipe INITIAL
User melihat barang baru di daftar barang
```

### 10.2 Alur Barang Masuk

```text
User buka halaman Stok Masuk
Pilih produk
Input jumlah masuk
Input supplier dan catatan
Klik Simpan
Sistem membaca stok saat ini
Sistem menghitung stock_after = stock_before + quantity
Sistem update stok produk
Sistem insert transaksi ke stock_in
Sistem insert riwayat ke stock_movements
Dashboard diperbarui
```

### 10.3 Alur Barang Keluar

```text
User buka halaman Stok Keluar
Pilih produk
Input jumlah keluar
Input penerima dan keperluan
Klik Simpan
Sistem membaca stok saat ini
Jika jumlah keluar > stok saat ini, transaksi ditolak
Jika stok cukup, sistem menghitung stock_after = stock_before - quantity
Sistem update stok produk
Sistem insert transaksi ke stock_out
Sistem insert riwayat ke stock_movements
Dashboard diperbarui
```

### 10.4 Alur Lihat Laporan

```text
User buka halaman Laporan
Pilih jenis laporan
Pilih rentang tanggal
Klik Terapkan Filter
Sistem mengambil data
Sistem menampilkan tabel laporan
User bisa export CSV/Excel
```

---

## 11. Kebutuhan Fungsional

### 11.1 Autentikasi

Fitur:

- Login
- Logout
- Proteksi halaman internal
- Role-based access sederhana

Role:

- owner
- admin
- staff

Hak akses:

| Fitur | Owner | Admin | Staff |
|---|---|---|---|
| Dashboard | Ya | Ya | Ya |
| Lihat barang | Ya | Ya | Ya |
| Tambah barang | Ya | Ya | Tidak |
| Edit barang | Ya | Ya | Tidak |
| Nonaktifkan barang | Ya | Ya | Tidak |
| Barang masuk | Ya | Ya | Ya |
| Barang keluar | Ya | Ya | Ya |
| Riwayat stok | Ya | Ya | Ya |
| Laporan | Ya | Ya | Opsional |
| Export laporan | Ya | Ya | Tidak |
| Pengguna | Ya | Tidak/Opsional | Tidak |
| Pengaturan | Ya | Tidak | Tidak |

### 11.2 Dashboard

Data yang ditampilkan:

- Total jenis barang aktif
- Total quantity stok
- Total barang menipis
- Total barang kosong
- Barang masuk hari ini
- Barang keluar hari ini
- Transaksi terbaru
- Top barang dengan stok paling rendah

### 11.3 Manajemen Barang

Fitur:

- Tambah barang
- Edit barang
- Cari barang
- Filter kategori
- Filter status stok
- Nonaktifkan barang
- Lihat detail barang

Validasi:

- Kode barang wajib
- Nama barang wajib
- Kategori wajib
- Satuan wajib
- Stok tidak boleh negatif
- Minimal stok tidak boleh negatif
- Harga tidak boleh negatif
- Kode barang harus unik

### 11.4 Barang Masuk

Validasi:

- Produk wajib dipilih
- Jumlah wajib lebih dari 0
- Tanggal wajib
- Produk harus aktif

### 11.5 Barang Keluar

Validasi:

- Produk wajib dipilih
- Jumlah wajib lebih dari 0
- Tanggal wajib
- Keperluan wajib
- Produk harus aktif
- Jumlah keluar tidak boleh melebihi stok tersedia

### 11.6 Riwayat Stok

Fitur:

- Menampilkan semua movements
- Search barang
- Filter tanggal
- Filter tipe
- Filter user
- Sort terbaru
- Export

Tipe movement:

- IN
- OUT
- ADJUSTMENT
- INITIAL

### 11.7 Stok Menipis

Status:

- Aman: `stock > min_stock`
- Menipis: `stock <= min_stock` dan `stock > 0`
- Kosong: `stock == 0`

### 11.8 Laporan

Jenis laporan:

1. Laporan barang masuk
2. Laporan barang keluar
3. Laporan stok akhir
4. Laporan movement stok
5. Laporan barang menipis

Export:

- CSV
- Excel `.xlsx`

---

## 12. Kebutuhan Non-Fungsional

### 12.1 Performa

Target:

- Dashboard load kurang dari 3 detik untuk data kecil-menengah
- Pencarian barang terasa cepat
- Transaksi stok selesai kurang dari 5 detik

Strategi:

- Gunakan query yang difilter
- Gunakan index pada field penting
- Hindari fetching semua data tanpa kebutuhan
- Cache ringan untuk dashboard jika diperlukan

### 12.2 Keamanan

- Supabase service role key tidak boleh terekspos di frontend
- Akses tulis sensitif harus lewat backend/server action
- Validasi input di frontend dan backend
- Role permission dicek di server
- Jika memakai Supabase Auth, gunakan session resmi Supabase
- Jangan commit credential ke repository

### 12.3 Reliabilitas

- Operasi stok masuk/keluar harus diproses dalam satu service backend
- Di Supabase/PostgreSQL, gunakan transaksi database atau RPC function untuk menjaga atomicity
- Sistem harus menghindari update stok tanpa mencatat movement
- Error harus jelas dan tidak membuat data setengah tersimpan

### 12.4 Maintainability

- Pisahkan logic database dalam repository/service khusus
- Gunakan schema validation
- Gunakan constant untuk enum role/status/movement type
- Struktur folder harus jelas
- UI tidak boleh langsung bergantung pada provider database

### 12.5 Skalabilitas

MVP cocok untuk:

- Ratusan hingga puluhan ribu baris data
- Tim kecil sampai menengah
- Transaksi harian operasional gudang

Jika transaksi semakin besar, PostgreSQL tetap bisa diskalakan melalui Supabase paid plan atau migrasi ke server PostgreSQL sendiri.

---

## 13. Rekomendasi Tech Stack

### 13.1 Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod validation

### 13.2 Backend

- Next.js API Routes atau Server Actions
- Repository/service layer
- Local repository untuk fase awal
- Supabase repository untuk final MVP

### 13.3 Auth

Fase awal:

- Local/mock login sederhana dengan seed user

Final MVP:

- Supabase Auth
- Tabel `profiles` untuk role dan status user

### 13.4 Data Storage

Fase awal:

- Local data mode
- SQLite atau mock repository

Final MVP:

- Supabase PostgreSQL

### 13.5 Deployment

- Vercel untuk aplikasi Next.js
- Supabase untuk database dan auth
- Environment variables untuk credential

---

## 14. Environment Variables

Contoh `.env.local` fase awal:

```env
NEXT_PUBLIC_APP_NAME=Stokira
APP_TIMEZONE=Asia/Jakarta
DATABASE_MODE=local
SESSION_SECRET=
```

Contoh `.env.local` fase Supabase:

```env
NEXT_PUBLIC_APP_NAME=Stokira
APP_TIMEZONE=Asia/Jakarta
DATABASE_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
```

Catatan:

- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai di server.
- Jangan expose service role key ke frontend.
- Jangan commit file `.env.local`.

---

## 15. Struktur Folder Rekomendasi

```text
/app
  /(auth)
    /login
      page.tsx
  /(dashboard)
    /dashboard
      page.tsx
    /barang
      page.tsx
      /tambah
        page.tsx
      /edit/[id]
        page.tsx
    /stok-masuk
      page.tsx
    /stok-keluar
      page.tsx
    /riwayat-stok
      page.tsx
    /stok-menipis
      page.tsx
    /laporan
      page.tsx
    /pengguna
      page.tsx
    /pengaturan
      page.tsx
/app/api
  /auth
  /products
  /stock-in
  /stock-out
  /movements
  /reports
/components
  /ui
  /forms
  /tables
  /dashboard
/lib
  /repositories
    local.ts
    supabase.ts
    products.ts
    stock-in.ts
    stock-out.ts
    movements.ts
    reports.ts
  /services
    stock-service.ts
    report-service.ts
  auth.ts
  validations.ts
  formatters.ts
  constants.ts
  permissions.ts
/types
  product.ts
  stock.ts
  user.ts
  report.ts
```

---

## 16. API Endpoint Rekomendasi

### 16.1 Auth

#### `POST /api/auth/login`

Login user.

### 16.2 Products

#### `GET /api/products`

Query params:

- search
- category
- status
- stockStatus

#### `POST /api/products`

Menambah produk baru.

#### `PUT /api/products/[id]`

Mengedit produk.

#### `PATCH /api/products/[id]/inactive`

Menonaktifkan produk.

### 16.3 Stock In

#### `POST /api/stock-in`

Membuat transaksi barang masuk.

Request:

```json
{
  "transaction_date": "2026-06-19",
  "product_id": "PRD-001",
  "quantity": 5,
  "supplier_name": "Supplier A",
  "invoice_number": "INV-001",
  "notes": "Restock"
}
```

### 16.4 Stock Out

#### `POST /api/stock-out`

Membuat transaksi barang keluar.

Request:

```json
{
  "transaction_date": "2026-06-19",
  "product_id": "PRD-001",
  "quantity": 2,
  "recipient": "Arnol",
  "purpose": "Instalasi",
  "reference_number": "JOB-001",
  "notes": "Instalasi customer Jakarta"
}
```

### 16.5 Movements

#### `GET /api/movements`

Query params:

- startDate
- endDate
- productId
- type
- userId

### 16.6 Reports

#### `GET /api/reports/stock-in`

#### `GET /api/reports/stock-out`

#### `GET /api/reports/current-stock`

#### `GET /api/reports/low-stock`

---

## 17. Desain UI/UX

### 17.1 Gaya Visual

Aplikasi harus terasa:

- Clean
- Modern
- Profesional
- Mudah dibaca
- Tidak terlalu ramai
- Cocok untuk admin operasional

### 17.2 Rekomendasi Tema

- Background: putih / abu sangat muda
- Primary color: biru atau emerald
- Accent: amber untuk warning stok menipis
- Red untuk stok kosong/error
- Green untuk barang masuk
- Neutral/blue untuk barang keluar

### 17.3 Komponen UI

- Sidebar navigation
- Topbar dengan user profile
- Dashboard cards
- Data table
- Search input
- Filter dropdown
- Date range picker
- Modal konfirmasi
- Toast notification
- Form validation message
- Empty state
- Loading skeleton

### 17.4 Navigasi Sidebar

```text
Dashboard
Data Barang
Stok Masuk
Stok Keluar
Riwayat Stok
Stok Menipis
Laporan
Pengguna
Pengaturan
```

---

## 18. Validasi dan Edge Cases

### 18.1 Input Jumlah 0

Pesan:

```text
Jumlah harus lebih dari 0.
```

### 18.2 Input Jumlah Negatif

Pesan:

```text
Jumlah tidak boleh negatif.
```

### 18.3 Barang Keluar Melebihi Stok

Pesan:

```text
Stok tidak mencukupi. Stok tersedia hanya {stock}.
```

### 18.4 Produk Tidak Ditemukan

Pesan:

```text
Produk tidak ditemukan atau sudah tidak aktif.
```

### 18.5 Kode Barang Duplikat

Pesan:

```text
Kode barang sudah digunakan.
```

### 18.6 Database Error

Pesan:

```text
Koneksi database gagal. Coba beberapa saat lagi.
```

### 18.7 Dua User Input Bersamaan

Mitigasi fase lokal:

- Semua transaksi diproses di service layer yang sama
- UI tidak mengubah stok langsung

Mitigasi fase Supabase:

- Gunakan transaksi PostgreSQL atau RPC function
- Lock row produk saat update stok jika diperlukan
- Constraint `stock >= 0`

---

## 19. Data Integrity Strategy

### 19.1 Satu Fungsi untuk Transaksi

Barang masuk dan barang keluar harus diproses melalui satu service backend.

```text
createStockIn()
- validate input
- get product
- calculate new stock
- update product stock
- insert stock_in row
- insert stock_movements row
```

```text
createStockOut()
- validate input
- get product
- check stock
- calculate new stock
- update product stock
- insert stock_out row
- insert stock_movements row
```

### 19.2 Jangan Update Stok Langsung dari UI

UI hanya mengirim request. Service/backend yang mengubah data.

### 19.3 Audit Movement

Jika stok di `products` berbeda dengan hasil hitung dari `stock_movements`, sistem bisa menampilkan warning di versi lanjutan.

### 19.4 Backup Database

Untuk Supabase/PostgreSQL:

```bash
pg_dump DATABASE_URL > backup-stokira.sql
```

Restore ke server baru:

```bash
psql NEW_DATABASE_URL < backup-stokira.sql
```

Untuk local mode:

- Export data lokal ke JSON/CSV
- Siapkan script migrasi ke Supabase
- Jangan jadikan local storage sebagai sumber data production

---

## 20. Format ID

Gunakan format ID agar mudah dibaca pada UI dan laporan.

Contoh:

```text
PRD-20260619-0001
SIN-20260619-0001
SOUT-20260619-0001
MOV-20260619-0001
USR-20260619-0001
SUP-20260619-0001
CAT-20260619-0001
```

Database boleh tetap memakai UUID internal, sementara kode human-readable disimpan di field terpisah.

---

## 21. Seed Data Awal

### 21.1 Categories

| id | name | status |
|---|---|---|
| CAT-001 | Mesin | active |
| CAT-002 | Filter | active |
| CAT-003 | Aksesoris | active |
| CAT-004 | Sparepart | active |
| CAT-005 | Tools | active |

### 21.2 Products

| id | code | name | category | unit | stock | min_stock | location | status |
|---|---|---|---|---|---:|---:|---|---|
| PRD-001 | WP-RO600 | RO 600G | Mesin | unit | 10 | 3 | Rak A1 | active |
| PRD-002 | FLT-COMP | Filter Composite | Filter | pcs | 25 | 10 | Rak B1 | active |
| PRD-003 | HOSE-14 | Selang 1/4 Inch | Aksesoris | meter | 50 | 15 | Rak C1 | active |
| PRD-004 | FAUCET-01 | Keran RO | Aksesoris | pcs | 12 | 5 | Rak C2 | active |

### 21.3 Users

| id | name | email | role | status |
|---|---|---|---|---|
| USR-001 | Owner | owner@example.com | owner | active |
| USR-002 | Admin Gudang | admin@example.com | admin | active |
| USR-003 | Staff Gudang | staff@example.com | staff | active |

---

## 22. Acceptance Criteria Global

Aplikasi dianggap MVP selesai jika:

- User bisa login
- User bisa melihat dashboard
- User bisa menambah data barang
- User bisa mengedit data barang
- User bisa mencatat barang masuk
- Stok bertambah otomatis setelah barang masuk
- User bisa mencatat barang keluar
- Stok berkurang otomatis setelah barang keluar
- Sistem menolak barang keluar jika stok tidak cukup
- Semua transaksi tercatat
- Semua perubahan stok tercatat di `stock_movements`
- User bisa melihat riwayat stok
- User bisa melihat barang menipis
- User bisa melihat laporan sederhana
- User bisa export data laporan
- Aplikasi bisa berjalan di local mode untuk fase desain
- Aplikasi siap dimigrasikan ke Supabase
- Credential Supabase aman di backend
- Aplikasi bisa dideploy ke Vercel

---

## 23. Roadmap Pengembangan

### Phase 0 - Local Design & Prototype

Fokus:

- Setup project
- Setup UI layout utama
- Setup local data repository
- Seed data lokal
- Dashboard basic
- CRUD barang basic
- Stok masuk/keluar lokal
- Validasi utama

### Phase 1 - MVP Core dengan Supabase

Fokus:

- Setup Supabase project
- Setup schema database
- Setup Supabase Auth
- Migrasi local repository ke Supabase repository
- CRUD barang production-ready
- Stok masuk/keluar dengan transaksi aman
- Riwayat stok
- Dashboard basic

### Phase 2 - Reporting & UX

Fokus:

- Laporan lengkap
- Export Excel/CSV
- Filter lanjutan
- UI lebih rapi
- Loading, empty, error state
- Role permission lebih stabil

### Phase 3 - Operational Upgrade

Fokus:

- Supplier management
- Penerima/teknisi management
- Adjustment stock
- Void/cancel transaksi
- Backup data
- Audit selisih stok

### Phase 4 - Advanced Features

Fokus:

- Barcode/QR code
- Multi gudang
- Approval barang keluar
- Notifikasi stok menipis
- Import Excel
- Migrasi ke dedicated PostgreSQL/server sendiri jika diperlukan

---

## 24. Risiko dan Mitigasi

### 24.1 Risiko: Local Mode Berbeda dari Supabase

Mitigasi:

- Gunakan type dan schema yang sama
- Semua akses data lewat repository interface
- Hindari logic bisnis di UI
- Buat script migrasi sejak awal

### 24.2 Risiko: Data Tidak Konsisten Saat Transaksi

Mitigasi:

- Semua transaksi diproses di service layer
- Di Supabase, gunakan transaksi PostgreSQL/RPC
- Tambahkan constraint `stock >= 0`
- Catat semua perubahan ke `stock_movements`

### 24.3 Risiko: Credential Bocor

Mitigasi:

- Simpan credential di environment variable
- Jangan commit `.env.local`
- Jangan expose service role key ke frontend
- Gunakan anon key hanya untuk akses client yang aman

### 24.4 Risiko: Backup Tidak Rutin

Mitigasi:

- Jadwalkan export database berkala
- Simpan backup di lokasi berbeda
- Test restore sebelum production

---

## 25. Prompt Implementasi untuk AI/Codex

```text
Buat aplikasi web stok gudang bernama Stokira menggunakan Next.js, TypeScript, Tailwind CSS, dan shadcn/ui.

Database final menggunakan Supabase PostgreSQL, tetapi fase awal harus berjalan dengan local mode terlebih dahulu. Buat arsitektur repository/service layer agar UI tidak bergantung langsung pada provider database.

Prioritas fase awal:
1. Setup aplikasi Next.js.
2. Buat layout dashboard dengan sidebar.
3. Buat local data repository dengan seed data.
4. Buat halaman login lokal sederhana.
5. Buat dashboard ringkasan stok.
6. Buat CRUD data barang.
7. Buat fitur barang masuk yang otomatis menambah stok dan mencatat stock_movements.
8. Buat fitur barang keluar yang otomatis mengurangi stok, menolak stok minus, dan mencatat stock_movements.
9. Buat halaman riwayat stok.
10. Buat halaman stok menipis.
11. Buat halaman laporan dengan filter tanggal dan export CSV/Excel.

Setelah UI dan alur final, migrasikan repository ke Supabase PostgreSQL dan Supabase Auth.

Gunakan UI modern, clean, dan mudah dipahami oleh admin gudang non-teknis.
Pastikan semua validasi dilakukan di frontend dan backend/service layer.
Gunakan timezone Asia/Jakarta.
```

---

## 26. Checklist Developer

### Setup Local

- [ ] Buat project Next.js + TypeScript
- [ ] Install Tailwind CSS
- [ ] Install shadcn/ui
- [ ] Setup struktur folder
- [ ] Buat repository interface
- [ ] Buat local repository
- [ ] Buat seed data lokal
- [ ] Buat service `stock-service.ts`

### Core Features Local

- [ ] Login lokal
- [ ] Dashboard
- [ ] Data barang
- [ ] Tambah barang
- [ ] Edit barang
- [ ] Nonaktifkan barang
- [ ] Barang masuk
- [ ] Barang keluar
- [ ] Riwayat stok
- [ ] Stok menipis
- [ ] Laporan
- [ ] Export

### Supabase Migration

- [ ] Buat Supabase project
- [ ] Buat schema PostgreSQL
- [ ] Setup Supabase Auth
- [ ] Buat tabel `profiles`
- [ ] Buat Supabase repository
- [ ] Migrasi seed data
- [ ] Test transaksi barang masuk
- [ ] Test transaksi barang keluar
- [ ] Test role permission
- [ ] Test backup `pg_dump`
- [ ] Test restore ke database baru

### Validation

- [ ] Cegah stok minus
- [ ] Cegah kode barang duplikat
- [ ] Cegah jumlah kosong
- [ ] Cegah jumlah negatif
- [ ] Cek produk aktif
- [ ] Tampilkan error message yang jelas

### Deployment

- [ ] Deploy ke Vercel
- [ ] Tambahkan environment variables di Vercel
- [ ] Hubungkan ke Supabase production
- [ ] Test login dan role permission
- [ ] Test transaksi barang masuk
- [ ] Test transaksi barang keluar
- [ ] Test export laporan

---

## 27. Definisi Sukses

Produk dianggap sukses untuk MVP jika:

- Admin tidak perlu lagi mencatat stok manual
- Semua stok masuk dan keluar tercatat rapi
- Owner bisa melihat stok menipis dengan cepat
- Laporan stok bisa dibuat dalam hitungan detik
- Data tersimpan di struktur yang siap masuk Supabase
- Backup dan restore bisa dilakukan dengan jelas
- Aplikasi bisa digunakan oleh staff non-teknis tanpa banyak training

---

## 28. Catatan Akhir

Stokira akan dibangun dengan pendekatan:

```text
Local-first development
Supabase-ready architecture
PostgreSQL-compatible data model
Service layer as the stable contract
```

Rekomendasi terbaik:

```text
Bangun UI dan flow dengan local mode.
Pastikan semua logic stok berada di service layer.
Setelah desain dan alur final, migrasikan repository ke Supabase.
Gunakan PostgreSQL backup/restore untuk portabilitas jangka panjang.
```
