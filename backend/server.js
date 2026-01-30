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

  // Handle events when a user sends a message
 socket.on("chat message", (data) => {
    console.log("Received:", data.message);

    // 1. Create an HTML snippet for the new message
    // We use hx-swap-oob="true" to tell HTMX to "append" it to the list
    const messageHtml = `
      <div hx-swap-oob="beforeend:#chat-logs">
        <p style="margin: 5px 0; border-bottom: 1px solid #444;">
          <strong style="color: #00ff00;">></strong> ${data.message}
        </p>
      </div>`;

    // 2. Broadcast the HTML to everyone
    io.emit("new-content", messageHtml);
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
  res.send("<h1>Server is running </h1>" + (messRes.y ? messRes.x + " " + messRes.y : messRes));
});

const port = process.env.PORT || 3001;

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://192.168.1.6:${port}`);
});
