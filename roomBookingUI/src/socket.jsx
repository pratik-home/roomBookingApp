import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('room_status_update', (data) => {
  console.log('Room status updated', data);
  // Handle room status update
});

export default socket;
