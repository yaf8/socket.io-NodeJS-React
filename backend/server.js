const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
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

app.use(express.static(path.join(__dirname, "public")));

let messRes = "";

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("chat message", (data) => {
    console.clear();
    console.log("Message from client ", socket.id, " :", data.message);

    // Update global variable
    messRes = data.message;

    // Create HTML for the server terminal
    const timestamp = new Date().toLocaleTimeString().split(' ')[0];
    const htmlSnippet = `
        <div class="log-entry" style="margin-bottom: 8px; border-left: 2px solid #0f0; padding-left: 10px; animation: fadeIn 0.3s ease;">
            <span style="color: #555;">[${timestamp}]</span> 
            <strong style="color: #0f0;"> USER:</strong> 
            <span style="color: #fff;">${data.message}</span>
        </div>`;

    // 1. Broadcast raw data to React Clients
    io.emit("chat message", data);

    // 2. Broadcast HTML to HTMX Server View
    io.emit("new-content", htmlSnippet);
  });

  socket.on("canvas hover change", (message) => {
    console.clear();
    console.log(message.message);
    messRes = message.message;
    io.emit("canvas hover change", message);
  });

  // When a user sends a video offer (signal)
  socket.on("video-offer", (data) => {
    console.log("Received video offer");
    console.log(data);
    // Send it to the other person
    socket.broadcast.emit("video-offer", data);
  });

  socket.on("video-answer", (data) => {
    console.log("Received video answer");
    socket.broadcast.emit("video-answer", data);
  });

  socket.on("new-ice-candidate", (data) => {
    console.log("Received ICE candidate");
    socket.broadcast.emit("new-ice-candidate", data);
  });

  // Receive the image data from a client
  socket.on("stream-frame", (data) => {
    // Wrap the image in an HTML tag that HTMX understands
    // We use hx-swap-oob="true" if we want to target a specific ID anywhere
    const htmlSnippet = `<img id="video-feed" src="${data}" style="width:100%; border:2px solid green;" />`;

    // Broadcast the HTML string to everyone
    io.emit("new-frame", htmlSnippet);
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
  res.send("<h1>Server is running </h1><p>Last Message: " + (typeof messRes === 'object' ? JSON.stringify(messRes) : messRes) + "</p>");
  // res.send("<h1>Server is running </h1>" + (messRes.y ? messRes.x + " " + messRes.y : messRes));
});

const port = process.env.PORT || 3001;

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://192.168.1.6:${port}`);
});
