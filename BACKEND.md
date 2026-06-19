# Stokira Backend

Backend ini adalah local-first API untuk fase desain awal Stokira. Data disimpan di file JSON lokal agar flow stok bisa diuji sebelum migrasi ke Supabase PostgreSQL.

## Menjalankan Server

```bash
npm run dev
```

Default URL:

```text
http://127.0.0.1:3001
```

Server juga melayani frontend statis dari `index.html`, `styles.css`, dan `app.js`.

## Database Lokal

Data tersimpan di:

```text
data/stokira-db.json
```

Jika file belum ada, backend otomatis membuat database dari seed.

## Auth Lokal

Endpoint login:

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Akun demo:

```text
owner@example.com
admin@example.com
staff@example.com
```

Password demo:

```text
password
```

Untuk endpoint yang butuh role, kirim header:

```text
X-User-Id: USR-001
```

Jika header tidak dikirim, backend memakai `USR-002` atau Admin Gudang sebagai actor default untuk memudahkan development lokal.

## Endpoint Utama

```http
GET /api/health
GET /api/bootstrap
GET /api/dashboard
GET /api/products
POST /api/products
PUT /api/products/:id
PATCH /api/products/:id/inactive
POST /api/stock-in
POST /api/stock-out
GET /api/movements
GET /api/reports
GET /api/reports/current-stock
GET /api/reports/low-stock
GET /api/reports/stock-in
GET /api/reports/stock-out
GET /api/reports/products.csv
GET /api/backup
POST /api/restore
POST /api/reset
```

## Contoh Barang Masuk

```bash
curl -X POST http://127.0.0.1:3001/api/stock-in ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: USR-002" ^
  -d "{\"productId\":\"PRD-001\",\"quantity\":5,\"supplierName\":\"Supplier A\",\"invoiceNumber\":\"INV-001\",\"notes\":\"Restock\"}"
```

## Contoh Barang Keluar

```bash
curl -X POST http://127.0.0.1:3001/api/stock-out ^
  -H "Content-Type: application/json" ^
  -H "X-User-Id: USR-002" ^
  -d "{\"productId\":\"PRD-001\",\"quantity\":2,\"recipient\":\"Arnol\",\"purpose\":\"Instalasi\",\"referenceNumber\":\"JOB-001\"}"
```

## Backup dan Restore

Backup lokal:

```http
GET /api/backup
```

Restore lokal:

```http
POST /api/restore
X-User-Id: USR-001
```

Body restore adalah JSON penuh dari hasil `/api/backup`.

## Catatan Migrasi Supabase

Backend ini sudah dipisah menjadi:

```text
backend/repositories/local-store.js
backend/services/stock-service.js
backend/server.js
```

Saat migrasi Supabase, target utamanya adalah mengganti repository local JSON menjadi repository Supabase/PostgreSQL. Business rule pada `stock-service.js` tetap menjadi kontrak utama.
