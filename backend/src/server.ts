import http from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { app } from "./app.js";

// config
import { setupWebSocket } from "./config/websocket.config.js";
import { connectDB, runMigrations } from "./db/index.js";

dotenv.config();

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

setupWebSocket(wss);

// ---- Start Server ----

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => runMigrations())
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
