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

# Create .env file
# Create a file named .env in the backend directory with the following content:
# values match the docker-compose.yml configuration
echo "PORT=5000
CLIENT_URL=http://localhost:5173

# Database
PGHOST=localhost
PGPORT=5433
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=connect4" > .env

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

---

## 🏗️ Architecture

- **State Management**: Active games are stored **in-memory** (Map) for low-latency real-time performance.
- **Persistence**: Completed games and player stats are persisted in **PostgreSQL**.
- **Decoupling**: **Kafka** is used to stream game events (Start, Move, End) to the analytics consumer, ensuring the game loop remains blazing fast.
- **Analytics**: A standalone **Consumer Service** processes events to compute metrics (e.g., Duration, Win Rates) asynchronously.
- **Performance**: The leaderboard uses indexed SQL queries for fast ranking.

## ⚖️ Tradeoffs & Scalability

Since this is a demo application, certain tradeoffs were made for simplicity vs. scale:

1.  **In-Memory State** → **Single Instance**
    - *Tradeoff*: Game state is held in the server's memory. This means the backend cannot currently be horizontally scaled (multiple instances would split the game state).
    - *Solution*: For production scale, state should be moved to a shared **Redis** store.

2.  **WebSocket Scaling**
    - *Tradeoff*: WebSockets require persistent connections.
    - *Solution*: Scaling would require a load balancer with **Sticky Sessions** or a Pub/Sub mechanism (like Redis Pub/Sub) to broadcast messages across instances.

3.  **Free-Tier Hosting (Render)**
    - *Tradeoff*: The free tier spins down after inactivity ("Cold Starts").
    - *Impact*: The first request might take 30-50s to wake up the server.

4.  **Kafka in Production**
    - *Tradeoff*: Running Kafka in production is expensive resources-wise.
    - *Solution*: The system is designed to gracefully degrade (skip analytics) if Kafka is unavailable.
