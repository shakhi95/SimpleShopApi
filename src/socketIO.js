//
const { Server } = require("socket.io");

let io;

exports.startIO = (httpServer, onClientConnect) => {
  io = new Server(httpServer, { cors: { origin: process.env.CLIENT_ORIGIN } });
  onClientConnect && io.on("connection", onClientConnect);
};

exports.getIO = () => io;
