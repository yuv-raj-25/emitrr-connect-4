# 4 In A Row (Connect 4)

A real-time multiplayer Connect 4 game built with React, Node.js, and WebSockets.

## Features

- 🎮 **Real-time Gameplay**: Instant moves and updates powered by WebSockets.
- 🤖 **Play vs Bot**: Challenge an AI opponent (Minimax algorithm).
- 👥 **Multiplayer**: Play against other players online.
- 🏆 **Leaderboard**: Track top players and scores (Persisted in PostgreSQL).
- 📱 **Responsive Design**: Works on desktop and mobile.
- 📜 **Game Guide**: Built-in rules and "How to Play" instructions.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, `ws` (WebSocket)
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- **Node.js** (v18 or higher)
- **Docker Desktop** (recommended for Database)
- **npm** or **yarn**

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd emitrr-assignment-4-connect
    ```

2.  **Install Dependencies**:

    Frontend:
    ```bash
    cd frontend
    npm install
    ```

    Backend:
    ```bash
    cd ../backend
    npm install
    ```

### running Locally

#### 1. Start the Database
Use Docker Compose to start the PostgreSQL instance.
```bash
# In the root directory
docker-compose up -d postgres
```
This starts PostgreSQL on port **5433** (mapped to 5432).

#### 2. Configure Backend
Create a `.env` file in the `backend/` directory:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/connect4
```

#### 3. Run Backend Server
The backend will automatically run database migrations on startup.
```bash
cd backend
npm run dev
```
You should see:
- `PostgreSQL connected`
- `Server running on port 3000`

#### 4. Run Frontend
In a new terminal:
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to play!

## Project Structure

```
.
├── backend/            # Express + WebSocket Server
│   ├── src/
│   │   ├── config/     # WebSocket & App Config
│   │   ├── db/         # Database Connection & Migrations
│   │   ├── services/   # Game Logic, Bot AI, Matchmaking
│   │   └── server.ts   # Entry Point
│   └── docker-compose.yml
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # React Components (GameGuide, Board, etc.)
│   │   ├── hooks/      # Custom Hooks (useGameSocket)
│   │   └── pages/      # Main Pages
└── README.md
```

## How to Play

1.  **Enter a Username**: To join the lobby.
2.  **Select Mode**:
    - **Play vs Bot**: Matches you against the AI immediately.
    - **Online Match**: Matches you with another waiting player.
3.  **The Game**:
    - Click on any column to drop your disc.
    - Connect 4 discs vertically, horizontally, or diagonally to win.
4.  **Disconnect**:
    - If a player disconnects, the game ends.
