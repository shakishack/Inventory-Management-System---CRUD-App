# Inventory Management System - CRUD App
Tugas SC BE Basic

## Author

Name : Shakila Ardelina  
NIM : 2410512033  
Prodi : S1 Sistem Informasi  
SC : BE Basic - Naufal  

---

Aplikasi CLI sederhana berbasis **Node.js** untuk mengelola data inventory barang.  
Dibuat sebagai tugas CRUD menggunakan **Array of Objects** dan **ES Modules (import/export)**. Dilengkapi juga dengan web dashboard interaktif (`index.html`).

---

## Struktur File

```
CRUD_BE/
│
├── data.js       → Array data inventory + ID generator
├── crud.js       → Semua fungsi logika CRUD (8 fitur)
├── index.js      → Alur utama program & tampilan menu CLI
├── index.html    → Web dashboard visualisasi inventory
├── package.json  → Konfigurasi project (type: module)
└── README.md     → Dokumentasi
```

---

## Cara Menjalankan

Pastikan **Node.js v17+** sudah terinstall.

```bash
# Jalankan program CLI
node index.js

# atau menggunakan npm
npm start
```

Untuk melihat tampilan Web Dashboard:
Buka file `index.html` langsung di browser Anda (Google Chrome / Edge / Firefox).

---

## Fitur CRUD (8 Fitur)

| No  | Fitur      | Deskripsi                                       |
| --- | ---------- | ----------------------------------------------- |
| 1   | Read All   | Tampilkan semua data barang dalam tabel         |
| 2   | Read by ID | Tampilkan detail 1 barang berdasarkan ID        |
| 3   | Create     | Tambah barang baru ke inventory                 |
| 4   | Update     | Edit data barang (nama, kategori, harga, dll)   |
| 5   | Delete     | Hapus barang dari inventory (dengan konfirmasi) |
| 6   | Search     | Cari barang berdasarkan nama / kategori         |
| 7   | Restock    | Update stok barang (tambah / kurangi)           |
| 8   | Summary    | Ringkasan total nilai & statistik inventory     |

---

## Konsep yang Digunakan

- **Array of Objects** → menyimpan data inventory di memori
- **ES Modules** → `import` / `export` antar file
- **readline/promises** → input dari user secara async/await
- **Array Methods** → `push`, `find`, `findIndex`, `splice`, `filter`, `reduce`
- **Rekursi async** → loop menu tanpa `while` loop

---
