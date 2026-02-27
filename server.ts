import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { createClient } from '@supabase/supabase-js';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log("Supabase client initialized");
} else {
  console.warn("Supabase credentials missing. Falling back to local SQLite.");
}

const db = new Database("confessions.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS confessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    nickname TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    reports_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    confession_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    nickname TEXT DEFAULT 'Anonymous',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (confession_id) REFERENCES confessions(id) ON DELETE CASCADE
  );
`);

// Migration: Ensure reports_count column exists for existing databases
try {
  db.exec("ALTER TABLE confessions ADD COLUMN reports_count INTEGER DEFAULT 0");
} catch (e) {
  // Column likely already exists
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/confessions", (req, res) => {
    try {
      const confessions = db.prepare("SELECT * FROM confessions WHERE status = 'approved' ORDER BY created_at DESC").all();
      res.json(confessions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/confessions", async (req, res) => {
    try {
      const { content, category, nickname } = req.body;
      console.log(`New confession attempt: ${category} - ${content.substring(0, 20)}...`);
      if (!content || !category) {
        return res.status(400).json({ error: "Content and category are required" });
      }
      const info = db.prepare("INSERT INTO confessions (content, category, nickname) VALUES (?, ?, ?)").run(content, category, nickname || "Anonymous");
      console.log(`Confession created with ID: ${info.lastInsertRowid}`);

      // Sync to Supabase if configured
      if (supabase) {
        const { error } = await supabase
          .from('confessions')
          .insert([
            { confession: content, like: 0 }
          ]);
        if (error) console.error("Supabase sync error:", error);
        else console.log("Synced to Supabase successfully");
      }

      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("Confession creation error:", err);
      res.status(500).json({ error: "Failed to save confession" });
    }
  });

  app.get("/api/confessions/:id/comments", (req, res) => {
    const { id } = req.params;
    const comments = db.prepare("SELECT * FROM comments WHERE confession_id = ? ORDER BY created_at ASC").all(id);
    res.json(comments);
  });

  app.post("/api/confessions/:id/comments", (req, res) => {
    const { id } = req.params;
    const { content, nickname } = req.body;
    if (!content) return res.status(400).json({ error: "Comment content required" });
    db.prepare("INSERT INTO comments (confession_id, content, nickname) VALUES (?, ?, ?)").run(id, content, nickname || "Anonymous");
    res.json({ success: true });
  });

  app.post("/api/confessions/:id/report", (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Reporting confession ID: ${id}`);
      const result = db.prepare("UPDATE confessions SET reports_count = reports_count + 1 WHERE id = ?").run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Confession not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Report error:", err);
      res.status(500).json({ error: "Failed to report confession" });
    }
  });

  // Admin Routes
  app.get("/api/admin/confessions", (req, res) => {
    try {
      const confessions = db.prepare("SELECT * FROM confessions ORDER BY reports_count DESC, created_at DESC").all();
      res.json(confessions);
    } catch (err) {
      console.error("Admin fetch error:", err);
      res.status(500).json({ error: "Failed to fetch confessions for admin" });
    }
  });

  app.patch("/api/admin/confessions/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      console.log(`Updating status for confession ID: ${id} to ${status}`);
      const result = db.prepare("UPDATE confessions SET status = ? WHERE id = ?").run(status, id);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Confession not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Status update error:", err);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  app.delete("/api/admin/confessions/:id", (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Deleting confession ID: ${id}`);
      const result = db.prepare("DELETE FROM confessions WHERE id = ?").run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Confession not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ error: "Failed to delete confession" });
    }
  });

  app.delete("/api/admin/comments/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM comments WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/confessions/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("UPDATE confessions SET likes = likes + 1 WHERE id = ?").run(id);
      
      // Sync to Supabase if configured
      if (supabase) {
        const confession = db.prepare("SELECT content, likes FROM confessions WHERE id = ?").get(id) as any;
        if (confession) {
          const { error } = await supabase
            .from('confessions')
            .update({ like: confession.likes })
            .eq('confession', confession.content);
          if (error) console.error("Supabase like sync error:", error);
        }
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Like error:", err);
      res.status(500).json({ error: "Failed to like" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
