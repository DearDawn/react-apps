import { isDev } from '@/utils';
import { io } from 'socket.io-client';


const socket = io(isDev ? 'http://localhost:7020' : `${location.origin}:9010`, {
  transports: ['websocket']
}); // 连接到服务器的Socket.IO实例

export { socket };
