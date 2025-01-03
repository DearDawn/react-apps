import { io } from 'socket.io-client';

export const socket = io(
  `${location.protocol}//${location.hostname}:7020/share`,
  {
    transports: ['websocket'],
    rememberUpgrade: true,
    path: '/socket.io',
  }
); // 连接到服务器的Socket.IO实例
