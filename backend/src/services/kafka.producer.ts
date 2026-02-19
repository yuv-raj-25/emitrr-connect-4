import { Kafka, Partitioners } from "kafkajs";
import type { Producer } from "kafkajs";

const kafka = new Kafka({
  clientId: "game-backend",
  brokers: ["localhost:9092"], // In production, use env var
  retry: {
    initialRetryTime: 100,
    retries: 5,
  },
});

let producer: Producer | null = null;

export const kafkaProducer = {
  connect: async () => {
    if (process.env.DISABLE_KAFKA === "true") {
      console.log("⚠️ Kafka is disabled. Analytics will be skipped.");
      return;
    }

    try {
      producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
      await producer.connect();
      console.log("✅ Kafka Producer connected");
    } catch (error) {
      console.error("❌ Kafka Producer connection failed:", error);
    }
  },

  sendGameEvent: async (eventType: string, payload: any) => {
    if (!producer) return;

    try {
      await producer.send({
        topic: "game-events",
        messages: [
          {
            key: payload.gameId || "global",
            value: JSON.stringify({
              eventType,
              payload,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });
    } catch (error) {
      console.error(`Failed to send Kafka event ${eventType}:`, error);
    }
  },

  disconnect: async () => {
    if (producer) {
      await producer.disconnect();
      console.log("Kafka Producer disconnected");
    }
  },
};
