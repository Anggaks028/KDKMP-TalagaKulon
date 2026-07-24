import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  initialPengaturan,
  initialStatistik,
  initialPengurus,
  initialPotensi,
  initialProduk,
  initialLayanan,
  initialArtikel,
  initialPromo,
  initialGaleri,
  initialMitra,
  initialFAQ,
  initialKontakPesan,
  initialPendaftaran
} from "./src/data/initialData.ts";

let dataStore = {
  pengaturan: { ...initialPengaturan },
  statistik: { ...initialStatistik },
  pengurus: [...initialPengurus],
  potensi: [...initialPotensi],
  produk: [...initialProduk],
  layanan: [...initialLayanan],
  artikel: [...initialArtikel],
  promo: [...initialPromo],
  galeri: [...initialGaleri],
  mitra: [...initialMitra],
  faq: [...initialFAQ],
  pesan: [...initialKontakPesan],
  pendaftaran: [...initialPendaftaran]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Admin Auth Endpoint
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if ((email === "admin@talagakulon.koperasi.id" || email === "admin") && password === "admin123") {
      return res.json({
        success: true,
        user: { name: "Administrator Koperasi", email: "admin@talagakulon.koperasi.id", role: "SuperAdmin" },
        token: "token-talagakulon-admin-2026"
      });
    }
    return res.status(401).json({ success: false, message: "Email atau password admin salah" });
  });

  // Stats
  app.get("/api/stats", (_req, res) => {
    // dynamically compute counts
    const updatedStats = {
      ...dataStore.statistik,
      jumlah_produk: dataStore.produk.length,
      jumlah_mitra: dataStore.mitra.length,
      jumlah_artikel: dataStore.artikel.length
    };
    res.json(updatedStats);
  });

  // Settings
  app.get("/api/pengaturan", (_req, res) => res.json(dataStore.pengaturan));
  app.put("/api/pengaturan", (req, res) => {
    dataStore.pengaturan = { ...dataStore.pengaturan, ...req.body };
    res.json({ success: true, data: dataStore.pengaturan });
  });

  // Generic CRUD Helper Creator
  const createCrudRoutes = (pathName: string, keyName: keyof typeof dataStore) => {
    app.get(`/api/${pathName}`, (_req, res) => {
      res.json(dataStore[keyName]);
    });

    app.post(`/api/${pathName}`, (req, res) => {
      const newItem = {
        id: `${pathName.slice(0, 3)}-${Date.now()}`,
        ...req.body
      };
      (dataStore[keyName] as any[]).unshift(newItem);
      res.status(201).json({ success: true, data: newItem });
    });

    app.put(`/api/${pathName}/:id`, (req, res) => {
      const { id } = req.params;
      const list = dataStore[keyName] as any[];
      const index = list.findIndex(item => item.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...req.body };
        return res.json({ success: true, data: list[index] });
      }
      res.status(404).json({ success: false, message: "Item tidak ditemukan" });
    });

    app.delete(`/api/${pathName}/:id`, (req, res) => {
      const { id } = req.params;
      const list = dataStore[keyName] as any[];
      dataStore[keyName] = list.filter(item => item.id !== id) as any;
      res.json({ success: true, message: "Item berhasil dihapus" });
    });
  };

  createCrudRoutes("pengurus", "pengurus");
  createCrudRoutes("potensi", "potensi");
  createCrudRoutes("produk", "produk");
  createCrudRoutes("layanan", "layanan");
  createCrudRoutes("artikel", "artikel");
  createCrudRoutes("promo", "promo");
  createCrudRoutes("galeri", "galeri");
  createCrudRoutes("mitra", "mitra");
  createCrudRoutes("faq", "faq");
  createCrudRoutes("pesan", "pesan");
  createCrudRoutes("pendaftaran", "pendaftaran");

  // Reset to default seed
  app.post("/api/reset", (_req, res) => {
    dataStore = {
      pengaturan: { ...initialPengaturan },
      statistik: { ...initialStatistik },
      pengurus: [...initialPengurus],
      potensi: [...initialPotensi],
      produk: [...initialProduk],
      layanan: [...initialLayanan],
      artikel: [...initialArtikel],
      promo: [...initialPromo],
      galeri: [...initialGaleri],
      mitra: [...initialMitra],
      faq: [...initialFAQ],
      pesan: [...initialKontakPesan],
      pendaftaran: [...initialPendaftaran]
    };
    res.json({ success: true, message: "Seluruh data berhasil direset ke data awal Talagakulon" });
  });

  // Serve Frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
