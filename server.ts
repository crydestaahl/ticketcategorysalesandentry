import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint for Tickster API
  app.post("/api/fetch-tickets", async (req, res) => {
    const { eogRequestCode, eventRequestCode, apikey, username, password } = req.body;

    if (!eogRequestCode || !eventRequestCode || !apikey || !username || !password) {
      return res.status(400).json({ error: "Saknar nödvändiga parametrar i anropet" });
    }

    const url = `https://api.tickster.com/sv/api/0.4/crm/${eogRequestCode}/event/${eventRequestCode}/ticketcodes?key=${apikey}`;
    
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    try {
      console.log(`Fetching from Tickster: ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Accept": "application/json",
          "User-Agent": "TicksterDashboard/1.0",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Tickster API error (${response.status}):`, errorText);
        return res.status(response.status).json({ 
          error: `Tickster API svarade med felkod ${response.status}`,
          details: errorText 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Internt serverfel vid anrop till Tickster", details: error.message });
    }
  });

  // Proxy endpoint for fetching events from organizer
  app.post("/api/fetch-events", async (req, res) => {
    const { eogRequestCode, apikey } = req.body;

    if (!eogRequestCode || !apikey) {
      return res.status(400).json({ error: "Saknar arrangörs ID (eogRequestCode) eller API-nyckel" });
    }

    const url = `https://event.api.tickster.com/api/v1.0/sv/organizers/${eogRequestCode}/events?api_key=${apikey}`;

    try {
      console.log(`Fetching events from Tickster: ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "TicksterDashboard/1.0",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Tickster Event API error (${response.status}):`, errorText);
        return res.status(response.status).json({
          error: `Tickster Event API svarade med felkod ${response.status}`,
          details: errorText
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Internt serverfel vid anrop till Tickster", details: error.message });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
