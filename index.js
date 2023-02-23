const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());

// create express server
const server = http.createServer(app);

const io = new Server(server, {
    cors : {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const roomVacancy = {}

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}}`);

    const roomsJoined = []

    socket.on('join_room', (roomId) => {
      if (!roomVacancy[roomId] || roomVacancy[roomId] === 0) {
        socket.join(roomId);
        console.log(`Player 1 joined room ${roomId}`);
        socket.emit('assign_symbol', {symbol: 'X', roomId});
        socket.emit('status_message', `You have joined room ${roomId}, waiting for opponent`);
        roomVacancy[roomId] = 1;
        roomsJoined.push(roomId);
      }
      else if (roomVacancy[roomId] === 1) {
        socket.join(roomId);
        console.log(`Player 2 joined room ${roomId}`);
        socket.emit('assign_symbol', {symbol: 'O', roomId});
        socket.to(roomId).emit('status_message', `Opponent has joined room ${roomId}, ready to play!`);
        socket.emit('status_message', `You have joined room ${roomId}, ready to play!`);
        roomVacancy[roomId]++;
        roomsJoined.push(roomId);
      } else {
        console.log(`${roomId} is full, declining entry`);
        socket.emit('status_message', `Sorry, room ${roomId} is currently full. Try another room!`);
      }
    });
    
    socket.on('disconnect', () => {
      // remove disconnected user from all rooms previously connected
      for (const room of roomsJoined) {
        roomVacancy[room]--;
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  
    socket.on('send_move', (data) => {
      console.log('Received move:', data);
      socket.to(data.room).emit('receive_move', data);
    });
  });
  
  const port = process.env.PORT || 3001;
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});