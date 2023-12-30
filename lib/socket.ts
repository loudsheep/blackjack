import { config } from 'dotenv';
import { io } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3002';

export const socket = io(URL, { autoConnect: false });