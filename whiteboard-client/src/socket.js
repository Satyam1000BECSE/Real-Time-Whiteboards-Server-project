import { io } from 'socket.io-client';

const socket = io('https://real-time-whiteboards-server-project.onrender.com');
export default socket;
