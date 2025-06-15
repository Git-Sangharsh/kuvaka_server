
# 🧠 Kuvaka Chat Server

This is the backend server for **Kuvaka**, a real-time chat application. It is built using **Node.js**, **Express**, **MongoDB**, and **WebSockets**.

---

## 📦 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- WebSocket (`ws`)
- HTTP
- dotenv
- CORS

---

## 📁 Project Structure

```
KUVAKA_SERVER/
├── node_modules/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following:

```env
MONGODB_USERNAME=your_mongo_user
MONGODB_PASSWORD=your_mongo_password
```

---

## 🧑‍💻 Local Setup & Running Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Git-Sangharsh/kuvaka_server.git
cd kuvaka_server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup `.env` file

Add MongoDB credentials as shown above.

### 4. Start the server

```bash
npm start
```

Server will start on `http://localhost:5000`.

---

## 🌐 API / WebSocket Communication

This server does not expose any REST API routes. All communication happens via **WebSocket**.

### Supported WebSocket Events:

- `init`: When a user joins the chat.
  - Sends back last 50 messages.
  - Broadcasts a system message.
- `typing`: When a user is typing.
  - Broadcasts typing indicator to others.
- `message`: When a new message is sent.
  - Saves to MongoDB.
  - Broadcasts to all users.

---

## 🧱 Architecture Overview

### 🧵 Concurrency Handling

- Each WebSocket connection is stored in a `Set` of clients.
- Broadcasts and typing indicators are managed in a loop over active connections.
- MongoDB operations are `async/await`-based to ensure consistency.

### 🔌 WebSocket Architecture

- The server uses `ws` library with a single WebSocket server layered over an HTTP server.
- Events are type-based and parsed from client payloads.

---

## 📜 Assumptions & Design Choices

- Messages are persisted in MongoDB with timestamps.
- WebSocket clients must send a `type: "init"` payload first to authenticate and register username.
- The server supports a simple chatroom, not private messaging or rooms.
- WebSocket connections are assumed to be short-lived; reconnection logic should be handled on the frontend.

---

## 🚀 Accessing the Deployed Chat App

Once deployed to [Render](https://render.com)

1. **Frontend URL**: `https://kuvaka-frontend.vercel.app/` (example)
2. **Backend/WebSocket URL**: `https://kuvaka-server-k2g1.onrender.com` or similar

---

## 📮 Contact

Made with ❤️ by [Your Name]
📧 Email: sangharshdev69@gmail.com
🐙 GitHub: [@your-handle](https://github.com/Git-Sangharsh)