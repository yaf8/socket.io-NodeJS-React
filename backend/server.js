const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(
  cors({
    origin: ["*"],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

let messRes = "";

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle events when a user sends a message
  socket.on("chat message", (message) => {
    console.clear();
    console.log(message.message);
    messRes = message.message;
    // Broadcast the message to all connected clients
    io.emit("chat message", message);
  });

  socket.on("canvas hover change", (message) => {
    console.clear();
    console.log(message.message);
    messRes = message.message;
    io.emit("canvas hover change", message);
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // Prevent immediate disconnection by handling ping timeout
  socket.on("ping", () => {
    socket.emit("pong");
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Server is running </h1>" + (messRes.y ? messRes.x + " " + messRes.y : messRes));
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
