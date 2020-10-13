import { Server } from "http";
import socketIO from "socket.io";

// Initialized in app.js and used everywhere using getIO
let ioServer: socketIO.Server | null;

export const init = (httpServer: Server) => {
  ioServer = socketIO(httpServer);
  return ioServer;
};

export const getIO = () => {
  if (!ioServer) {
    throw new Error("Socket.io not initialized");
  }
  return ioServer;
};

// const socket = {
//   init: (httpServer: Server) => {
//     ioServer = socketIO(httpServer);
//     return ioServer;
//   },
//   getIO: () => {
//     if (!ioServer) {
//       throw new Error("Socket.io not initialized");
//     }
//     return ioServer;
//   },
// };

// export default socket;
