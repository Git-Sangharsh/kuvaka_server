import express from "express";
import mongoose from "mongoose";
import { WebSocketServer } from "ws";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const PORT = 5000;

// ======== MongoDB Setup ========
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@mainnikedb.jx4pwkk.mongodb.net/chat`
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// ======== Mongoose Schema ========
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
const Message = mongoose.model("Message", messageSchema);

// ======== Create HTTP Server ========
const server = http.createServer(app);

// ======== WebSocket Setup ========
const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on("connection", async (ws) => {
  clients.add(ws);

  ws.on("message", async (data) => {
    try {
      const parsed = JSON.parse(data);

      // User sends username initially
      if (parsed.type === "init") {
        ws.username = parsed.username;

        // Send last 50 messages
        const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
        ws.send(
          JSON.stringify({
            type: "history",
            messages: messages.reverse(),
          })
        );
      }

      // User sends new chat message
      else if (parsed.type === "message") {
        const newMsg = await Message.create({
          username: ws.username,
          message: parsed.message,
        });

        const payload = JSON.stringify({
          type: "message",
          message: newMsg,
        });

        // Broadcast to all clients
        for (let client of clients) {
          if (client.readyState === ws.OPEN) {
            client.send(payload);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error handling message:", error);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

// ======== Start Server ========
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
