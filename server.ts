import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

import { 
  initialProfile, initialPengurus, initialPotensi, initialProducts, 
  initialArticles, initialPromos, initialGallery, initialPartners, initialFAQs 
} from "./src/data/initialData.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database Stores with Initial Seed
let profileData = { ...initialProfile };
let pengurusData = [...initialPengurus];
let potensiData = [...initialPotensi];
let productsData = [...initialProducts];
let articlesData = [...initialArticles];
let promosData = [...initialPromos];
let galleryData = [...initialGallery];
let partnersData = [...initialPartners];
let faqsData = [...initialFAQs];
let contactMessages: any[] = [];
let memberApplications: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // --- API ROUTES ---

  // Profile API
  app.get("/api/profile", (req, res) => {
    res.json(profileData);
  });
  app.put("/api/profile", (req, res) => {
    profileData = { ...profileData, ...req.body };
    res.json(profileData);
  });

  // Pengurus API
  app.get("/api/pengurus", (req, res) => res.json(pengurusData));
  app.post("/api/pengurus", (req, res) => {
    const newItem = { id: `p_${Date.now()}`, ...req.body };
    pengurusData.push(newItem);
    res.json(newItem);
  });
  app.put("/api/pengurus/:id", (req, res) => {
    const index = pengurusData.findIndex((p) => p.id === req.params.id);
    if (index !== -1) {
      pengurusData[index] = { ...pengurusData[index], ...req.body };
      return res.json(pengurusData[index]);
    }
    res.status(404).json({ error: "Item not found" });
  });
  app.delete("/api/pengurus/:id", (req, res) => {
    pengurusData = pengurusData.filter((p) => p.id !== req.params.id);
    res.json({ success: true });
  });

  // Potensi Desa API
  app.get("/api/potensi", (req, res) => res.json(potensiData));
  app.post("/api/potensi", (req, res) => {
    const newItem = { id: `pot_${Date.now()}`, ...req.body };
    potensiData.push(newItem);
    res.json(newItem);
  });
  app.put("/api/potensi/:id", (req, res) => {
    const index = potensiData.findIndex((p) => p.id === req.params.id);
    if (index !== -1) {
      potensiData[index] = { ...potensiData[index], ...req.body };
      return res.json(potensiData[index]);
    }
    res.status(404).json({ error: "Item not found" });
  });
  app.delete("/api/potensi/:id", (req, res) => {
    potensiData = potensiData.filter((p) => p.id !== req.params.id);
    res.json({ success: true });
  });

  // Products API
  app.get("/api/products", (req, res) => res.json(productsData));
  app.post("/api/products", (req, res) => {
    const newItem = { id: `prod_${Date.now()}`, ...req.body };
    productsData.push(newItem);
    profileData.stats.productsCount = productsData.length;
    res.json(newItem);
  });
  app.put("/api/products/:id", (req, res) => {
    const index = productsData.findIndex((p) => p.id === req.params.id);
    if (index !== -1) {
      productsData[index] = { ...productsData[index], ...req.body };
      return res.json(productsData[index]);
    }
    res.status(404).json({ error: "Item not found" });
  });
  app.delete("/api/products/:id", (req, res) => {
    productsData = productsData.filter((p) => p.id !== req.params.id);
    profileData.stats.productsCount = productsData.length;
    res.json({ success: true });
  });

  // Articles API
  app.get("/api/articles", (req, res) => res.json(articlesData));
  app.post("/api/articles", (req, res) => {
    const newItem = { id: `art_${Date.now()}`, ...req.body };
    articlesData.push(newItem);
    profileData.stats.articlesCount = articlesData.length;
    res.json(newItem);
  });
  app.put("/api/articles/:id", (req, res) => {
    const index = articlesData.findIndex((a) => a.id === req.params.id);
    if (index !== -1) {
      articlesData[index] = { ...articlesData[index], ...req.body };
      return res.json(articlesData[index]);
    }
    res.status(404).json({ error: "Item not found" });
  });
  app.delete("/api/articles/:id", (req, res) => {
    articlesData = articlesData.filter((a) => a.id !== req.params.id);
    profileData.stats.articlesCount = articlesData.length;
    res.json({ success: true });
  });

  // Promos API
  app.get("/api/promos", (req, res) => res.json(promosData));
  app.post("/api/promos", (req, res) => {
    const newItem = { id: `pro_${Date.now()}`, ...req.body };
    promosData.push(newItem);
    res.json(newItem);
  });
  app.put("/api/promos/:id", (req, res) => {
    const index = promosData.findIndex((p) => p.id === req.params.id);
    if (index !== -1) {
      promosData[index] = { ...promosData[index], ...req.body };
      return res.json(promosData[index]);
    }
    res.status(404).json({ error: "Item not found" });
  });
  app.delete("/api/promos/:id", (req, res) => {
    promosData = promosData.filter((p) => p.id !== req.params.id);
    res.json({ success: true });
  });

  // Gallery API
  app.get("/api/gallery", (req, res) => res.json(galleryData));
  app.post("/api/gallery", (req, res) => {
    const newItem = { id: `gal_${Date.now()}`, ...req.body };
    galleryData.push(newItem);
    res.json(newItem);
  });
  app.delete("/api/gallery/:id", (req, res) => {
    galleryData = galleryData.filter((g) => g.id !== req.params.id);
    res.json({ success: true });
  });

  // Partners API
  app.get("/api/partners", (req, res) => res.json(partnersData));
  app.post("/api/partners", (req, res) => {
    const newItem = { id: `part_${Date.now()}`, ...req.body };
    partnersData.push(newItem);
    res.json(newItem);
  });

  // FAQ API
  app.get("/api/faqs", (req, res) => res.json(faqsData));
  app.post("/api/faqs", (req, res) => {
    const newItem = { id: `faq_${Date.now()}`, ...req.body };
    faqsData.push(newItem);
    res.json(newItem);
  });

  // Contact Messages API
  app.get("/api/contact", (req, res) => res.json(contactMessages));
  app.post("/api/contact", (req, res) => {
    const msg = {
      id: `msg_${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      status: "Baru"
    };
    contactMessages.unshift(msg);
    res.json({ success: true, message: msg });
  });

  // Member Applications API
  app.get("/api/member-applications", (req, res) => res.json(memberApplications));
  app.post("/api/member-application", (req, res) => {
    const appItem = {
      id: `app_${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      status: "Menunggu Verifikasi"
    };
    memberApplications.unshift(appItem);
    res.json({ success: true, application: appItem });
  });
  app.put("/api/member-applications/:id", (req, res) => {
    const index = memberApplications.findIndex((a) => a.id === req.params.id);
    if (index !== -1) {
      memberApplications[index] = { ...memberApplications[index], ...req.body };
      if (req.body.status === "Disetujui") {
        profileData.stats.membersCount += 1;
      }
      return res.json(memberApplications[index]);
    }
    res.status(404).json({ error: "Application not found" });
  });

  // Gemini AI Assistant Endpoint
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: "API Key Gemini belum diset. Anda dapat mengkonfigurasinya di menu Secrets." 
        });
      }
      const ai = new GoogleGenAI({ apiKey });
      const { prompt, context } = req.body;

      const systemPrompt = `Anda adalah asisten AI resmi untuk Koperasi Desa Merah Putih Desa Talagakulon, Kecamatan Talaga, Kabupaten Majalengka, Jawa Barat. Berikan jawaban dalam bahasa Indonesia yang formal, sopan, komunikatif, dan informatif. Context: ${context || 'Koperasi Desa Talagakulon'}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${systemPrompt}\n\nUser Prompt: ${prompt}`
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini AI error:", err);
      res.status(500).json({ error: err.message || "Gagal berkomunikasi dengan Gemini AI" });
    }
  });

  // Vite Middleware handling for development and production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Koperasi Talagakulon running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
