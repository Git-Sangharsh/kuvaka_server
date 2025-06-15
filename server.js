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

      if (parsed.type === "init") {
        ws.username = parsed.username;

        // Send last 50 messages to the new user
        const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
        ws.send(
          JSON.stringify({
            type: "history",
            messages: messages.reverse(),
          })
        );

        // Broadcast: [username] joined the chat
        const joinMessage = {
          type: "system",
          message: `${ws.username} joined the chat`,
          timestamp: new Date().toISOString(),
        };

        for (let client of clients) {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(joinMessage));
          }
        }
      }

      // typing event
      else if (parsed.type === "typing") {
        const typingPayload = JSON.stringify({
          type: "typing",
          username: ws.username,
        });

        for (let client of clients) {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(typingPayload);
          }
        }
      }


      // User sends new message
      else if (parsed.type === "message") {
        const newMsg = await Message.create({
          username: ws.username,
          message: parsed.message,
        });

        const payload = JSON.stringify({
          type: "message",
          message: newMsg,
        });

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

    // Broadcast: [username] left the chat
    if (ws.username) {
      const leaveMessage = {
        type: "system",
        message: `${ws.username} left the chat`,
        timestamp: new Date().toISOString(),
      };

      for (let client of clients) {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(leaveMessage));
        }
      }
    }
  });
});

// ======== Start Server ========
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
