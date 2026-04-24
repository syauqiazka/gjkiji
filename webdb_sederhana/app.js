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
    nama TEXT
  )
`);

// halaman utama
app.get("/", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    let html = `
    <html>
    <head>
      <title>Data Siswa Kelas XI</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <h1>Data Siswa Kelas XI</h1>

        <form method="POST" action="/tambah">
          <input type="text" name="nama" placeholder="Masukkan nama" required>
          <button type="submit">Tambah</button>
        </form>

        <ul>
    `;

    rows.forEach((item) => {
      html += `
        <li>
          ${item.nama}
          <a href="/hapus/${item.id}">Hapus</a>
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

// tambah
app.post("/tambah", (req, res) => {
  const { nama } = req.body;
  db.run("INSERT INTO items (nama) VALUES (?)", [nama]);
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