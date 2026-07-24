import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory data store with lazy init capability
let storeData: any = null;

// Initialize Gemini client lazily
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn("Gemini AI initialization failed:", err);
    }
  }
  return genAIClient;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    coop: 'Koperasi Desa Merah Putih Talagakulon',
    location: 'Talaga, Majalengka, Jawa Barat',
    timestamp: new Date().toISOString()
  });
});

// API endpoint for Gemini AI Assistant for Koperasi
app.post('/api/gemini-ask', async (req, res) => {
  try {
    const { prompt, contextHistory } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Intelligent fallback answer if Gemini key is not configured or fails
      return res.json({
        reply: `[MitraAI Talagakulon - Offline Mode]\n\nTerima kasih atas pertanyaan Anda mengenai "${prompt}".\n\nUntuk informasi resmi seputar keanggotaan, simpan pinjam, dan pembelian produk Koperasi Desa Merah Putih Talagakulon, Anda dapat menghubungi Pengurus via WhatsApp di +62 821-1928-3741 atau datang langsung ke Kantor Koperasi di Jl. Raya Talaga - Cikijing No. 45, Desa Talagakulon, Majalengka.`
      });
    }

    const systemInstruction = `
Anda adalah MitraAI Talagakulon, Asisten Virtual resmi dari Koperasi Desa Merah Putih Desa Talagakulon, Kecamatan Talaga, Kabupaten Majalengka, Jawa Barat.
Tugas Anda:
1. Menjawab pertanyaan masyarakat, anggota, dan calon investor secara ramah, sopan, informatif, dan dengan bahasa Indonesia yang jelas.
2. Memberikan informasi tentang profil koperasi, layanan simpan pinjam syariah, syarat keanggotaan (Simpanan Pokok Rp100rb, Wajib Rp20rb/bln), pupuk organik, produk UMKM (Kopi Ciremai, Opak, Kerajinan Bambu, Beras Pandan Wangi), potensi desa (perkebunan cengkeh, wisata, peternakan), serta alamat kantor di Jl. Raya Talaga - Cikijing No. 45, Desa Talagakulon.
3. Selalu bersikap membantu, positif, dan mempromosikan ekonomi gotong royong pedesaan Talagakulon Majalengka.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nPertanyaan Pengguna: ${prompt}` }] }
      ]
    });

    const replyText = response.text || "Maaf, sistem AI sedang berhalangan. Silakan hubungi pengurus via WhatsApp.";
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.json({
      reply: "Terima kasih atas pertanyaan Anda. Layanan Asisten AI Koperasi saat ini sedang sibuk. Silakan hubungi Kantor Koperasi Desa Merah Putih Talagakulon di Jl. Raya Talaga - Cikijing No. 45 atau melalui WhatsApp +62 821-1928-3741."
    });
  }
});

// Download SQL & PHP Native Source Exporter Endpoint
app.get('/api/export/sql', (req, res) => {
  const sqlContent = `-- ============================================================
-- SQL DUMP DATABASE: kdmp_talagakulon
-- Koperasi Desa Merah Putih Desa Talagakulon, Majalengka
-- Dibuat otomatis untuk deployment ke MySQL / Shared Hosting / cPanel
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS \`kdmp_talagakulon\`;
CREATE DATABASE IF NOT EXISTS \`kdmp_talagakulon\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`kdmp_talagakulon\`;

-- 1. TABEL USERS (ADMIN & PENGELOLA)
CREATE TABLE \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`nama_lengkap\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL,
  \`role\` ENUM('admin', 'pengurus', 'petugas') DEFAULT 'admin',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`users\` (\`username\`, \`password\`, \`nama_lengkap\`, \`email\`, \`role\`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.X2g6i.qG2', 'Administrator Utama', 'admin@kdmp-talagakulon.id', 'admin');

-- 2. TABEL PROFIL KOPERASI
CREATE TABLE \`profil_koperasi\` (
  \`id\` INT PRIMARY KEY DEFAULT 1,
  \`nama_koperasi\` VARCHAR(150) NOT NULL,
  \`tagline\` VARCHAR(255),
  \`deskripsi\` TEXT,
  \`sejarah\` TEXT,
  \`visi\` TEXT,
  \`misi\` TEXT,
  \`nilai_nilai\` TEXT,
  \`no_ahu\` VARCHAR(100),
  \`nib\` VARCHAR(100),
  \`npwp\` VARCHAR(100),
  \`alamat\` TEXT,
  \`rt_rw\` VARCHAR(20),
  \`desa\` VARCHAR(50),
  \`kecamatan\` VARCHAR(50),
  \`kabupaten\` VARCHAR(50),
  \`telepon\` VARCHAR(30),
  \`whatsapp\` VARCHAR(30),
  \`email\` VARCHAR(100),
  \`jam_operasional\` VARCHAR(100),
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`profil_koperasi\` (\`id\`,\`nama_koperasi\`,\`tagline\`,\`deskripsi\`,\`sejarah\`,\`visi\`,\`misi\`,\`no_ahu\`,\`nib\`,\`alamat\`,\`telepon\`,\`whatsapp\`,\`email\`) VALUES
(1, 'Koperasi Desa Merah Putih Talagakulon', 'Bersama Membangun Ekonomi Desa yang Mandiri', 'Koperasi Desa Merah Putih Talagakulon merupakan badan usaha milik warga desa yang bergerak di bidang pelayanan simpan pinjam, pupuk, & UMKM.', 'Berdiri pada tahun 2021 atas prakarsa warga Talagakulon, Majalengka.', 'Terwujudnya Koperasi Desa Mandiri dan Berdaya Saing 2030.', 'Melayani simpan pinjam, pemasaran produk UMKM, penyediaan pupuk.', 'AHU-0012845.AH.01.26.TAHUN 2021', '9120304918231', 'Jl. Raya Talaga - Cikijing No. 45', '(0233) 892014', '6282119283741', 'koperasi.merahputih.talagakulon@gmail.com');

-- 3. TABEL PENGURUS
CREATE TABLE \`pengurus\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nama\` VARCHAR(100) NOT NULL,
  \`jabatan\` VARCHAR(100) NOT NULL,
  \`foto\` VARCHAR(255),
  \`bio\` TEXT,
  \`telepon\` VARCHAR(30),
  \`urutan\` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`pengurus\` (\`nama\`, \`jabatan\`, \`foto\`, \`bio\`, \`urutan\`) VALUES
('H. Sukarna, S.Pd.', 'Ketua Umum Koperasi', 'sukarna.jpg', 'Penggiat ekonomi pedesaan Talagakulon', 1),
('Asep Sunandar, S.E.', 'Sekretaris I', 'asep.jpg', 'Pengelola administrasi digital', 2),
('Hj. Ratna Kurniasih', 'Bendahara Utama', 'ratna.jpg', 'Pengelola arus kas simpanan anggota', 3);

-- 4. TABEL POTENSI DESA
CREATE TABLE \`potensi_desa\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`judul\` VARCHAR(150) NOT NULL,
  \`kategori\` VARCHAR(50) NOT NULL,
  \`foto\` VARCHAR(255),
  \`deskripsi\` TEXT,
  \`potensi_ekonomi\` TEXT,
  \`peluang_investasi\` TEXT,
  \`lokasi\` VARCHAR(100),
  \`featured\` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABEL KATEGORI PRODUK & PRODUK
CREATE TABLE \`kategori_produk\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nama_kategori\` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`kategori_produk\` (\`nama_kategori\`) VALUES
('Simpan Pinjam'), ('Sembako'), ('Pupuk'), ('Bibit'), ('Alat Pertanian'), ('Produk UMKM'), ('Kerajinan'), ('Hasil Pertanian');

CREATE TABLE \`produk\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`kategori_id\` INT,
  \`nama_produk\` VARCHAR(150) NOT NULL,
  \`harga\` DECIMAL(12,2) DEFAULT 0,
  \`satuan\` VARCHAR(50),
  \`foto\` VARCHAR(255),
  \`deskripsi\` TEXT,
  \`stok_status\` VARCHAR(50) DEFAULT 'Tersedia',
  \`penjual\` VARCHAR(100),
  \`featured\` TINYINT(1) DEFAULT 0,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`kategori_id\`) REFERENCES \`kategori_produk\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. TABEL ARTIKEL
CREATE TABLE \`artikel\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`judul\` VARCHAR(200) NOT NULL,
  \`slug\` VARCHAR(200) NOT NULL UNIQUE,
  \`penulis\` VARCHAR(100),
  \`kategori\` VARCHAR(50),
  \`foto\` VARCHAR(255),
  \`ringkasan\` TEXT,
  \`isi\` LONGTEXT,
  \`views\` INT DEFAULT 0,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. TABEL PROMO
CREATE TABLE \`promo\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`judul\` VARCHAR(150) NOT NULL,
  \`jenis\` VARCHAR(50),
  \`foto\` VARCHAR(255),
  \`deskripsi\` TEXT,
  \`berlaku_sampai\` DATETIME,
  \`kode_promo\` VARCHAR(50),
  \`aktif\` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. TABEL GALERI, MITRA, FAQ, KONTAK
CREATE TABLE \`galeri\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`judul\` VARCHAR(150) NOT NULL,
  \`tipe\` ENUM('image', 'video') DEFAULT 'image',
  \`url\` VARCHAR(255),
  \`kategori\` VARCHAR(50),
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE \`mitra\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nama\` VARCHAR(100) NOT NULL,
  \`kategori\` VARCHAR(50),
  \`logo\` VARCHAR(255),
  \`website\` VARCHAR(150)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE \`faq\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`pertanyaan\` VARCHAR(255) NOT NULL,
  \`jawaban\` TEXT NOT NULL,
  \`kategori\` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE \`pesan_kontak\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nama\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100),
  \`telepon\` VARCHAR(30),
  \`subjek\` VARCHAR(150),
  \`pesan\` TEXT,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="schema_kdmp_talagakulon.sql"');
  res.send(sqlContent);
});

async function startServer() {
  // Vite Middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Server Koperasi Desa Merah Putih running on http://localhost:${PORT}`);
  });
}

startServer();
