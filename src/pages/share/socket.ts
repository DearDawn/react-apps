import { isDev } from '@/utils';
import { io } from 'socket.io-client';

const socket = io(isDev ? `http://${location.hostname}:7020` : `${location.origin}:7020`, {
  transports: ['websocket']
}); // 连接到服务器的Socket.IO实例

export { socket };
