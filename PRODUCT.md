# Stokira

## Register

product

## Purpose

Aplikasi web untuk mencatat, memantau, dan mengelola stok gudang. Membantu admin gudang mencatat barang masuk/keluar, memantau stok real-time, melihat barang hampir habis, dan membuat laporan stok. Fase awal menggunakan local mode (localStorage) sebelum migrasi ke Supabase PostgreSQL.

## Target Users

- Admin gudang yang mengelola stok harian
- Staff gudang yang input barang masuk/keluar
- Pemilik usaha kecil/menengah yang memantau kondisi stok
- Tim teknisi yang mengambil barang dari gudang

## Brand Personality

Professional, reliable, dan clean. Aplikasi ini harus terasa seperti tool yang bisa dipercaya untuk data stok penting - bukan flashy, bukan mainan. Tone-nya serius tapi tidak kaku, seperti spreadsheet yang lebih pintar dan lebih aman.

## Anti-References

- Desain AI-generated generik (gradient text, glassmorphism, hero metrics tanpa konteks)
- Over-decorated admin panels dengan animasi berlebihan
- Dashboard yang terlihat bagus tapi tidak fungsional

## Design Principles

1. **Data integrity first** - Setiap perubahan stok harus jelas, tercatat, dan bisa diaudit
2. **Zero learning curve** - Admin gudang non-teknis harus bisa pakai tanpa training
3. **Density over decoration** - Informasi padat lebih berharga dari white space berlebih
4. **Trust through clarity** - Status stok, badge, dan angka harus bisa dipahami sekilas
5. **Local-first, cloud-ready** - UI tidak boleh bergantung pada detail implementasi database

## Tech Stack

- Vanilla HTML/CSS/JS (single-page app via hash routing)
- No framework, no bundler
- localStorage sebagai data store (local mode)
- Node.js backend (Express) untuk fase selanjutnya

## Key Surfaces

- Login page (split layout: visual + form)
- Dashboard (metric cards + restock list + recent movements)
- Data Barang (master table with filters + CRUD modal)
- Stok Masuk / Keluar (transaction forms)
- Riwayat Stok (movement audit log with filters)
- Stok Menipis (priority restock table)
- Laporan (summary metrics + stock report + CSV export)
- Pengguna (user management, owner-only)
- Pengaturan (app settings + data reset)
