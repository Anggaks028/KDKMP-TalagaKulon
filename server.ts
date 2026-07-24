import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  initialProfilKoperasi,
  initialPengurus,
  initialPotensiDesa,
  initialKategoriProduk,
  initialProduk,
  initialKategoriArtikel,
  initialArtikel,
  initialPromo,
  initialGaleri,
  initialMitra,
  initialFAQ,
  initialBanner,
  initialPengaturanWeb,
  initialStatistik
} from './src/data/initialData.js';

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database Persistence File Path
const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

// Interface for DB state
interface DatabaseState {
  profil: typeof initialProfilKoperasi;
  pengurus: typeof initialPengurus;
  potensi: typeof initialPotensiDesa;
  kategoriProduk: typeof initialKategoriProduk;
  produk: typeof initialProduk;
  kategoriArtikel: typeof initialKategoriArtikel;
  artikel: typeof initialArtikel;
  promo: typeof initialPromo;
  galeri: typeof initialGaleri;
  mitra: typeof initialMitra;
  faq: typeof initialFAQ;
  pesan: any[];
  banner: typeof initialBanner;
  pengaturan: typeof initialPengaturanWeb;
  statistik: typeof initialStatistik;
}

// Memory Cache initialized from disk or defaults
let db: DatabaseState = {
  profil: initialProfilKoperasi,
  pengurus: initialPengurus,
  potensi: initialPotensiDesa,
  kategoriProduk: initialKategoriProduk,
  produk: initialProduk,
  kategoriArtikel: initialKategoriArtikel,
  artikel: initialArtikel,
  promo: initialPromo,
  galeri: initialGaleri,
  mitra: initialMitra,
  faq: initialFAQ,
  pesan: [
    {
      id: 'pesan-1',
      nama: 'Bapak Dudung',
      email: 'dudung.talaga@gmail.com',
      whatsapp: '081234567890',
      subjek: 'Pertanyaan Pemesanan Beras Pandanwangi',
      pesan: 'Assalamu alaikum admin, apakah beras pandanwangi sak 5kg bisa dikirim ke Cirebon untuk pembelian 10 sak?',
      tanggal: new Date().toLocaleDateString('id-ID'),
      dibaca: false
    }
  ],
  banner: initialBanner,
  pengaturan: initialPengaturanWeb,
  statistik: initialStatistik
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      db = { ...db, ...parsed };
      console.log('Database loaded successfully from disk.');
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error('Error loading database file, using default values:', err);
  }
}

function saveDatabase() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

// Load DB on startup
loadDatabase();

// API ROUTES
const router = express.Router();

// GET all data
router.get('/data', (req, res) => {
  res.json({
    success: true,
    data: db
  });
});

// Admin Auth Login
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    return res.json({
      success: true,
      token: 'token-koperasi-admin-talagakulon-2026',
      user: {
        id: 'usr-1',
        name: 'Administrator Koperasi',
        role: 'Super Admin',
        username: 'admin'
      }
    });
  }
  return res.status(401).json({ success: false, message: 'Username atau password salah! (Gunakan: admin / admin123)' });
});

// CRUD: Profil
router.put('/profil', (req, res) => {
  db.profil = { ...db.profil, ...req.body };
  saveDatabase();
  res.json({ success: true, data: db.profil, message: 'Profil Koperasi berhasil diperbarui!' });
});

// CRUD: Pengurus
router.post('/pengurus', (req, res) => {
  const newPengurus = { id: 'p-' + Date.now(), urutan: db.pengurus.length + 1, ...req.body };
  db.pengurus.push(newPengurus);
  saveDatabase();
  res.json({ success: true, data: newPengurus, message: 'Data pengurus berhasil ditambahkan!' });
});

router.put('/pengurus/:id', (req, res) => {
  const index = db.pengurus.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    db.pengurus[index] = { ...db.pengurus[index], ...req.body };
    saveDatabase();
    res.json({ success: true, data: db.pengurus[index], message: 'Data pengurus berhasil diperbarui!' });
  } else {
    res.status(404).json({ success: false, message: 'Pengurus tidak ditemukan' });
  }
});

router.delete('/pengurus/:id', (req, res) => {
  db.pengurus = db.pengurus.filter(p => p.id !== req.params.id);
  saveDatabase();
  res.json({ success: true, message: 'Pengurus berhasil dihapus!' });
});

// CRUD: Potensi Desa
router.post('/potensi', (req, res) => {
  const newPotensi = { id: 'pot-' + Date.now(), ...req.body };
  db.potensi.push(newPotensi);
  saveDatabase();
  res.json({ success: true, data: newPotensi, message: 'Potensi Desa berhasil ditambahkan!' });
});

router.put('/potensi/:id', (req, res) => {
  const index = db.potensi.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    db.potensi[index] = { ...db.potensi[index], ...req.body };
    saveDatabase();
    res.json({ success: true, data: db.potensi[index], message: 'Potensi Desa berhasil diperbarui!' });
  } else {
    res.status(404).json({ success: false, message: 'Potensi tidak ditemukan' });
  }
});

router.delete('/potensi/:id', (req, res) => {
  db.potensi = db.potensi.filter(p => p.id !== req.params.id);
  saveDatabase();
  res.json({ success: true, message: 'Potensi berhasil dihapus!' });
});

// CRUD: Kategori Produk
router.post('/kategori-produk', (req, res) => {
  const newKat = { id: 'kat-' + Date.now(), ...req.body };
  db.kategoriProduk.push(newKat);
  saveDatabase();
  res.json({ success: true, data: newKat });
});

// CRUD: Produk
router.post('/produk', (req, res) => {
  const newProduk = { id: 'prod-' + Date.now(), slug: 'prod-' + Date.now(), ...req.body };
  db.produk.push(newProduk);
  db.statistik.jumlahProduk = db.produk.length;
  saveDatabase();
  res.json({ success: true, data: newProduk, message: 'Produk berhasil ditambahkan!' });
});

router.put('/produk/:id', (req, res) => {
  const index = db.produk.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    db.produk[index] = { ...db.produk[index], ...req.body };
    saveDatabase();
    res.json({ success: true, data: db.produk[index], message: 'Produk berhasil diperbarui!' });
  } else {
    res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
  }
});

router.delete('/produk/:id', (req, res) => {
  db.produk = db.produk.filter(p => p.id !== req.params.id);
  db.statistik.jumlahProduk = db.produk.length;
  saveDatabase();
  res.json({ success: true, message: 'Produk berhasil dihapus!' });
});

// CRUD: Artikel
router.post('/artikel', (req, res) => {
  const newArtikel = { id: 'art-' + Date.now(), slug: 'art-' + Date.now(), viewCount: 0, ...req.body };
  db.artikel.unshift(newArtikel);
  db.statistik.jumlahArtikel = db.artikel.length;
  saveDatabase();
  res.json({ success: true, data: newArtikel, message: 'Artikel berita berhasil ditambahkan!' });
});

router.put('/artikel/:id', (req, res) => {
  const index = db.artikel.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    db.artikel[index] = { ...db.artikel[index], ...req.body };
    saveDatabase();
    res.json({ success: true, data: db.artikel[index], message: 'Artikel berhasil diperbarui!' });
  } else {
    res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });
  }
});

router.delete('/artikel/:id', (req, res) => {
  db.artikel = db.artikel.filter(a => a.id !== req.params.id);
  db.statistik.jumlahArtikel = db.artikel.length;
  saveDatabase();
  res.json({ success: true, message: 'Artikel berhasil dihapus!' });
});

// CRUD: Promo
router.post('/promo', (req, res) => {
  const newPromo = { id: 'prm-' + Date.now(), status: 'Aktif', ...req.body };
  db.promo.unshift(newPromo);
  saveDatabase();
  res.json({ success: true, data: newPromo, message: 'Promo berhasil ditambahkan!' });
});

router.put('/promo/:id', (req, res) => {
  const index = db.promo.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    db.promo[index] = { ...db.promo[index], ...req.body };
    saveDatabase();
    res.json({ success: true, data: db.promo[index], message: 'Promo berhasil diperbarui!' });
  } else {
    res.status(404).json({ success: false, message: 'Promo tidak ditemukan' });
  }
});

router.delete('/promo/:id', (req, res) => {
  db.promo = db.promo.filter(p => p.id !== req.params.id);
  saveDatabase();
  res.json({ success: true, message: 'Promo berhasil dihapus!' });
});

// CRUD: Galeri
router.post('/galeri', (req, res) => {
  const newItem = { id: 'gal-' + Date.now(), ...req.body };
  db.galeri.unshift(newItem);
  saveDatabase();
  res.json({ success: true, data: newItem, message: 'Item galeri berhasil ditambahkan!' });
});

router.delete('/galeri/:id', (req, res) => {
  db.galeri = db.galeri.filter(g => g.id !== req.params.id);
  saveDatabase();
  res.json({ success: true, message: 'Item galeri berhasil dihapus!' });
});

// CRUD: Mitra
router.post('/mitra', (req, res) => {
  const newMitra = { id: 'mit-' + Date.now(), ...req.body };
  db.mitra.push(newMitra);
  db.statistik.jumlahMitra = db.mitra.length;
  saveDatabase();
  res.json({ success: true, data: newMitra, message: 'Mitra berhasil ditambahkan!' });
});

router.delete('/mitra/:id', (req, res) => {
  db.mitra = db.mitra.filter(m => m.id !== req.params.id);
  db.statistik.jumlahMitra = db.mitra.length;
  saveDatabase();
  res.json({ success: true, message: 'Mitra berhasil dihapus!' });
});

// CRUD: FAQ
router.post('/faq', (req, res) => {
  const newFaq = { id: 'faq-' + Date.now(), ...req.body };
  db.faq.push(newFaq);
  saveDatabase();
  res.json({ success: true, data: newFaq, message: 'FAQ berhasil ditambahkan!' });
});

router.put('/faq/:id', (req, res) => {
  const index = db.faq.findIndex(f => f.id === req.params.id);
  if (index !== -1) {
    db.faq[index] = { ...db.faq[index], ...req.body };
    saveDatabase();
    res.json({ success: true, data: db.faq[index], message: 'FAQ berhasil diperbarui!' });
  } else {
    res.status(404).json({ success: false, message: 'FAQ tidak ditemukan' });
  }
});

router.delete('/faq/:id', (req, res) => {
  db.faq = db.faq.filter(f => f.id !== req.params.id);
  saveDatabase();
  res.json({ success: true, message: 'FAQ berhasil dihapus!' });
});

// POST Kontak Pesan (Form Kontak)
router.post('/pesan', (req, res) => {
  const newPesan = {
    id: 'pesan-' + Date.now(),
    tanggal: new Date().toLocaleDateString('id-ID'),
    dibaca: false,
    ...req.body
  };
  db.pesan.unshift(newPesan);
  saveDatabase();
  res.json({ success: true, message: 'Pesan Anda berhasil dikirim! Tim Koperasi Talagakulon akan segera menghubungi Anda.' });
});

router.put('/pesan/:id/baca', (req, res) => {
  const msg = db.pesan.find(p => p.id === req.params.id);
  if (msg) {
    msg.dibaca = true;
    saveDatabase();
  }
  res.json({ success: true });
});

router.delete('/pesan/:id', (req, res) => {
  db.pesan = db.pesan.filter(p => p.id !== req.params.id);
  saveDatabase();
  res.json({ success: true, message: 'Pesan berhasil dihapus' });
});

// UPDATE Pengaturan & Banner
router.put('/pengaturan', (req, res) => {
  db.pengaturan = { ...db.pengaturan, ...req.body };
  saveDatabase();
  res.json({ success: true, data: db.pengaturan, message: 'Pengaturan website berhasil diperbarui!' });
});

// XML Sitemap Endpoint
router.get('/sitemap.xml', (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://koperasi-talagakulon.desa.id';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>
  <url><loc>${baseUrl}/#profil</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>
  <url><loc>${baseUrl}/#potensi</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>
  <url><loc>${baseUrl}/#produk</loc><priority>0.9</priority><changefreq>daily</changefreq></url>
  <url><loc>${baseUrl}/#berita</loc><priority>0.9</priority><changefreq>daily</changefreq></url>
  <url><loc>${baseUrl}/#promo</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>
  <url><loc>${baseUrl}/#faq</loc><priority>0.6</priority><changefreq>monthly</changefreq></url>
  <url><loc>${baseUrl}/#kontak</loc><priority>0.7</priority><changefreq>monthly</changefreq></url>
</urlset>`;
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://koperasi-talagakulon.desa.id';
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/api/sitemap.xml`);
});

// Mount router under /api
app.use('/api', router);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Koperasi Merah Putih Talagakulon running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
