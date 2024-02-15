const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const socketIO = require('socket.io');
const cors = require("cors")

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
});

app.use(cors({
    origin: ['*'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle events when a user sends a message
    socket.on('chat message', (message) => {
        console.log('Message from client:', message);
        // Broadcast the message to all connected clients
        io.emit('chat message', message);
    });

    // Handle disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.get("/", (req, res) => {
    res.send("<h1>Server is running</h1>");
  });

const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
