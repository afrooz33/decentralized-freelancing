const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());

let users = {}; // Track connected users by their username

io.on('connection', (socket) => {
  console.log('A user connected');

  // Set username and track user ID
  socket.on('setUserID', (username) => {
    socket.username = username;
    users[username] = socket.id; // Store socket ID by username
    console.log(`User ${username} connected with socket ID ${socket.id}`);
  });

  // Handle private message
  socket.on('private message', ({ content, to }) => {
    console.log(`Private message from ${socket.username} to ${to}: ${content}`);
    if (users[to]) {
      io.to(users[to]).emit('private message', {
        content,
        from: socket.username,
      });
    } else {
      console.log(`User ${to} not connected`);
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    delete users[socket.username]; // Remove user from tracking
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
