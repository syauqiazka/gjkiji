const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// database
const db = new sqlite3.Database("database.db");

// buat tabel
db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT,
    kelas TEXT
  )
`);

// halaman utama
app.get("/", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    let html = `
    <html>
    <head>
      <title>Data Siswa </title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <h1>Data Siswa </h1>

        <form method="POST" action="/tambah">
          <input type="text" name="nama" placeholder="Masukkan nama" required>
          <input type="text" name="kelas" placeholder="Masukkan kelas" required>
          <button type="submit">Tambah</button>
        </form>

        <ul>
    `;

    rows.forEach((item) => {
      html += `
        <li>
          <span class="nama">${item.nama}</span>
          <span class="kelas">${item.kelas}</span>
          <div class="aksi">
            <a href="/edit/${item.id}" class="edit">Edit</a>
            <a href="/hapus/${item.id}" class="hapus" onclick="return confirm('Yakin hapus?')">Hapus</a>
          </div>
        </li>
      `;
    });

    html += `
        </ul>
      </div>
    </body>
    </html>
    `;

    res.send(html);
  });
});

// tambah nama
app.post("/tambah", (req, res) => {
  const { nama, kelas } = req.body;
  db.run("INSERT INTO items (nama, kelas) VALUES (?, ?)", [nama, kelas]);
  res.redirect("/");
});


app.get("/edit/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM items WHERE id = ?", [id], (err, row) => {
    const html = `
    <html>
    <head>
      <title>Edit Data</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <h1>Edit Nama</h1>

        <form method="POST" action="/update/${row.id}">
          <input type="text" name="nama" value="${row.nama}" required>
          <input type="text" name="kelas" value="${row.kelas}" required>
          <button type="submit">Update</button>
        </form>

        <a href="/">Kembali</a>
      </div>
    </body>
    </html>
    `;

    res.send(html);
  });
});

// update data
app.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { nama } = req.body;
  const { kelas } = req.body;

  db.run("UPDATE items SET nama = ?, kelas = ? WHERE id = ?", [nama, kelas, id]);
  res.redirect("/");
});

// hapus
app.get("/hapus/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM items WHERE id = ?", [id]);
  res.redirect("/");
});

// jalankan server
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});