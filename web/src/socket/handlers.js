module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle user joining a room
        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room ${room}`);
        });

        // Handle user leaving a room
        socket.on('leaveRoom', (room) => {
            socket.leave(room);
            console.log(`User ${socket.id} left room ${room}`);
        });

        // Handle sending a message
        socket.on('sendMessage', (data) => {
            const { room, message } = data;
            io.to(room).emit('receiveMessage', {
                user: socket.id,
                message,
                timestamp: new Date()
            });
            console.log(`Message from ${socket.id} to room ${room}: ${message}`);
        });

        // Handle user disconnecting
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });
    });
};