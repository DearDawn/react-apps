import { isDev } from '@/utils/dev';
import { io } from 'socket.io-client';

const socket = io(isDev ? `${location.protocol}//${location.hostname}:7020` : `${location.origin}:7020`, {
  transports: ['websocket'],
  rememberUpgrade: true
}); // 连接到服务器的Socket.IO实例

export { socket };
