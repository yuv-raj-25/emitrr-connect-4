import { WebSocketServer, WebSocket } from "ws";

export function setupWebSocket(wss: WebSocketServer) {
  wss.on("connection", (socket: WebSocket) => {
    console.log("New client connected");

    socket.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log("Received:", data);

        socket.send(
          JSON.stringify({
            type: "MESSAGE_RECEIVED",
            payload: data,
          })
        );
      } catch (err) {
        console.error("Invalid message format");
      }
    });

    socket.on("close", () => {
      console.log("Client disconnected");
    });
  });
}
