import io from 'socket.io-client';
import { isDev } from '@/utils';

const socket = io(isDev ? 'http://localhost:9009' : `${location.origin}:9010`); // 连接到服务器的Socket.IO实例

export { socket };
