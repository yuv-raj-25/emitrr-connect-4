# 4 In A Row (Connect 4) 🔴🟡

A real-time multiplayer Connect 4 game built with **React**, **Node.js**, **WebSockets**, and **PostgreSQL**. Features a smart AI bot, live matchmaking, and an optional real-time analytics pipeline powered by **Kafka**.

![Game Screenshot](https://via.placeholder.com/800x400?text=Connect+4+Game+Preview)

## ✨ Features

- **Real-time Multiplayer**: Instant moves via WebSockets.
- **Play vs Bot**: Challenge a Minimax-powered AI.
- **Leaderboard**: persistent win/loss tracking.
- **Resilient**: Handles disconnects with a 30s reconnection window.
- **Analytics (Optional)**: Kafka pipeline for tracking game stats locally.
- **Responsive**: Full mobile support.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, `ws`
- **Database**: PostgreSQL (via Docker)
- **Analytics**: Kafka, Zookeeper (via Docker)

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- **Node.js** (v18+)
- **Docker Desktop** (for DB & Kafka)
- **npm** or **yarn**

### 1. Start Infrastructure (DB & Kafka)

Use Docker Compose to spin up PostgreSQL and the analytics stack.

```bash
# In project root
docker-compose up -d
```
> **Note**: 
> - PostgreSQL runs on port **5433** (mapped locally).
> - Kafka runs on port **9092**.
> - Zookeeper runs on port **2181**.

### 2. Backend Setup

The backend handles game logic, WebSocket connections, and DB migrations.

```bash
cd backend

# Install dependencies
npm install

# Create .env (Optional - defaults work for local Docker)
# CP .env.example .env

# Start Server (Auto-runs migrations)
npm run dev
```
> Server runs on **http://localhost:5000**.

### 3. Frontend Setup

The frontend is the React game client.

```bash
cd frontend

# Install dependencies
npm install

# Start Dev Server
npm run dev
```
> Open **http://localhost:5173** to play!

---

## 📊 Analytics (Local Only)

Enable real-time metrics (Avg Duration, Top Winners, Activity) using Kafka.
*This is optional and disabled in production.*

1. **Ensure Kafka is running** (`docker-compose up -d`).
2. **Start the Consumer Service**:
   ```bash
   cd backend
   npx tsx src/consumer.ts
   ```
3. **Play a game**. The terminal will show live stats like:
   ```
   📈 --- Live Metrics ---
   ⏱️  Avg Game Duration: 42.5s
   📅 Games Today:       15
   🏆 Top Winners:       [ { winner: 'Yuvi', count: 5 } ]
   ```

---

## 🚢 Production Deployment

The backend is hardened for production environments (like Render) where Kafka might not be available.

- **DISABLE_KAFKA**: Set `DISABLE_KAFKA=true` in your env vars to skip connection attempts.
- **Resilience**: Even without the var, the backend catches connection errors and proceeds safely.

---

## 📝 Troubleshooting

- **Port 5000 in use?**
  - Kill the process: `lsof -t -i:5000 | xargs kill -9`
- **Migration failed?**
  - The migration script is idempotent. Just restart the backend.
- **Kafka connection refused?**
  - Ensure Docker is running. Wait a few seconds for containers to initialize.
