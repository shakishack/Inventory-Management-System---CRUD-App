# Inventory Management System - MERN Stack REST API

## Author

Name : Shakila Ardelina  
NIM : 2410512033  
Prodi : S1 Sistem Informasi  
SC : BE Basic - Naufal  

---

Aplikasi **Order & Inventory Management System** berbasis **MERN Stack** (MongoDB, Express.js, React, Node.js) dengan arsitektur backend REST API modular yang terhubung permanen ke **MongoDB Atlas**.

---

## Tech Stack

- **MongoDB Atlas & Mongoose** — Penyimpanan database permanen & schema validation
- **Express.js & Node.js** — Server REST API modular (`async/await`)
- **React & Vite** — Frontend dashboard manajemen inventaris & order

---

## Struktur Folder

```
CRUD_BE/
├── config/
│   └── db.js                   # Koneksi database MongoDB
├── models/
│   └── Order.js                # Schema & Model Mongoose Order
├── controllers/
│   └── orderController.js      # Logika bisnis & HTTP response CRUD (async/await)
├── routes/
│   └── orderRoutes.js          # Definisi endpoint /api/orders
├── client/                     # Frontend React (Vite)
│   ├── src/
│   │   ├── api/orders.js
│   │   ├── utils/format.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── app.js                      # Konfigurasi Express middleware & routes
├── index.js                    # Entry point server
├── seed.js                     # Seeder data awal ke MongoDB
├── .env.example                # Template environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## Cara Menjalankan Aplikasi

Pastikan **Node.js v18+** dan akses ke **MongoDB Atlas** sudah tersedia.

### 1. Setup Environment Variables

Salin `.env.example` menjadi `.env`, lalu isi `MONGODB_URI` dengan connection string MongoDB Anda:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/inventory_db?retryWrites=true&w=majority
MONGODB_DB_NAME=inventory_db
```

### 2. Install Dependencies

```bash
npm install
npm run client:install
```

### 3. Build Frontend & Seed Data Awal (Opsional)

```bash
npm run client:build
npm run seed
```

### 4. Jalankan Server

- **Production / Express + React Dist** (port `5000`):
  ```bash
  npm start
  ```
- **Development Mode** (jalankan di 2 terminal terpisah):
  ```bash
  # Terminal 1 - Backend API (http://localhost:5000)
  npm run dev

  # Terminal 2 - Frontend React Vite (http://localhost:5173)
  npm run client:dev
  ```

---

## Daftar Endpoint API

Base URL: `http://localhost:5000/api/orders`

| Method | Endpoint | Deskripsi | Status Code |
| ------ | -------- | --------- | ----------- |
| `GET` | `/api/health` | Cek status server API | `200` |
| `GET` | `/api/orders` | Ambil semua data order (opsional query `?status=`, `?category=`, `?search=`) | `200`, `500` |
| `GET` | `/api/orders/summary` | Ringkasan statistik total order, revenue, profit, dan kategori | `200`, `500` |
| `GET` | `/api/orders/:id` | Ambil detail 1 order berdasarkan MongoDB `_id` | `200`, `400`, `404`, `500` |
| `POST` | `/api/orders` | Tambah order baru ke MongoDB | `201`, `400`, `500` |
| `PUT` | `/api/orders/:id` | Update data order berdasarkan `_id` | `200`, `400`, `404`, `500` |
| `PATCH` | `/api/orders/:id` | Update sebagian field order berdasarkan `_id` | `200`, `400`, `404`, `500` |
| `DELETE` | `/api/orders/:id` | Hapus order berdasarkan `_id` | `200`, `400`, `404`, `500` |

### Contoh Request & Response

#### `POST /api/orders`

Request Body (`Content-Type: application/json`):

```json
{
  "productName": "AMD Ryzen 9 7950X",
  "category": "CPU",
  "description": "16 Cores, 32 Threads, Up to 5.7GHz",
  "standardCost": 450,
  "listPrice": 599,
  "quantity": 15,
  "status": "Pending",
  "warehouse": "Jakarta",
  "customerName": "Shakila Ardelina",
  "orderDate": "21-11-2026"
}
```

Response (`201 Created`):

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "673f...",
    "productName": "AMD Ryzen 9 7950X",
    "category": "CPU",
    "description": "16 Cores, 32 Threads, Up to 5.7GHz",
    "standardCost": 450,
    "listPrice": 599,
    "profit": 149,
    "quantity": 15,
    "status": "Pending",
    "warehouse": "Jakarta",
    "customerName": "Shakila Ardelina",
    "orderDate": "21-11-2026"
  }
}
```

---

## Testing API di Postman

1. Jalankan server dengan `npm start`.
2. Uji endpoint secara berurutan di Postman:
   - `GET http://localhost:5000/api/orders`
   - `POST http://localhost:5000/api/orders` (Body -> `raw` -> `JSON`)
   - `GET http://localhost:5000/api/orders/<_id_hasil_post>`
   - `PUT http://localhost:5000/api/orders/<_id_hasil_post>`
   - `PATCH http://localhost:5000/api/orders/<_id_hasil_post>`
   - `DELETE http://localhost:5000/api/orders/<_id_hasil_post>`
   - `GET http://localhost:5000/api/orders/summary`
