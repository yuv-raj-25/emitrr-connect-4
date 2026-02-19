import { Kafka } from "kafkajs";
import { connectDB, getDB } from "./db/index.js";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: "analytics-service",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "analytics-group" });

async function run() {
  console.log("📊 Analytics Service Starting...");

  await connectDB();
  const db = getDB();

  await consumer.connect();
  await consumer.subscribe({ topic: "game-events", fromBeginning: true });

  console.log("✅ Custom Analytics Consumer Connected");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value?.toString();
      if (!value) return;

      const event = JSON.parse(value);
      const { eventType, payload, timestamp } = event;

      console.log(`📥 [${topic}] ${eventType}:`, payload.gameId);

      // 1. Log Raw Event
      try {
        await db.query(
          "INSERT INTO analytics_events (event_type, payload, created_at) VALUES ($1, $2, $3)",
          [eventType, JSON.stringify(payload), timestamp]
        );
      } catch (err) {
        console.error("Failed to log event:", err);
      }

      // 2. Compute Metrics on GAME_OVER
      if (eventType === "GAME_OVER") {
        try {
            // Avg Duration
            const durationRes = await db.query(`
                SELECT AVG((payload->>'duration')::float)::numeric(10,1) as avg_duration 
                FROM analytics_events 
                WHERE event_type = 'GAME_OVER'
            `);

            // Total Games Today
            const totalGamesRes = await db.query(`
                SELECT COUNT(*) as count 
                FROM analytics_events 
                WHERE event_type = 'GAME_START' 
                AND created_at > CURRENT_DATE
            `);
            
            // Let's compute wins per user from raw events
            const winsRes = await db.query(`
                SELECT payload->>'winner' as winner, COUNT(*) as count
                FROM analytics_events
                WHERE event_type = 'GAME_OVER' AND payload->>'winner' IS NOT NULL
                GROUP BY winner
                ORDER BY count DESC
                LIMIT 3
            `);

            console.log("\n📈 --- Live Metrics ---");
            console.log(`⏱️  Avg Game Duration: ${durationRes.rows[0].avg_duration || 0}s`);
            console.log(`📅 Games Today:       ${totalGamesRes.rows[0].count}`);
            console.log("🏆 Top Winners:", winsRes.rows);
            console.log("-----------------------\n");
            
        } catch (err) {
            console.error("Failed to compute metrics:", err);
        }
      }
    },
  });
}

run().catch(console.error);
