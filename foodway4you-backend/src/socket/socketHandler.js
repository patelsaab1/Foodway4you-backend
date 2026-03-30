export default (io) => {
  io.on('connection', (socket) => {
    console.log("socket working : ",socket.id);
    socket.on('join', (room) => {
      if (room) socket.join(room);
    });

    socket.on('order:update', (payload) => {
      if (payload?.orderId) {
        io.to(`order:${payload.orderId}`).emit('order:status', payload);
      }
    });

    socket.on('location:update', (payload) => {
      if (payload?.orderId) {
        io.to(`order:${payload.orderId}`).emit('location:current', payload);
      }
    });

    socket.on('disconnect', () => {});
  });
};
