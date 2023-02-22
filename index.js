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

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}}`);

    let count = 0;


    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Client joined room ${roomId}`);
        if (count === 0) {
            socket.to(roomId).emit('assignSymbol', {symbol: 'X', roomId});
            count++;
        } else {
            socket.to(roomId).emit('assignSymbol', {symbol: 'O', roomId});
        }
    });
    
    socket.on('disconnect', () => {
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