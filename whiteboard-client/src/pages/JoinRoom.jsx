// // === src/components/JoinRoom.jsx === 

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const JoinRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    try {
      await axios.post(`http://localhost:8080/api/rooms/join`, {
        roomId,
        userId,
      });
      navigate(`/room/${roomId}?userId=${userId}`);
    } catch (err) {
      alert('Room not found');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <label id='joinlabel' htmlFor="joinUserId">Your Name / ID:</label>
      <input
        type="text"
        id="joininput"
        placeholder="Enter your Name/ID............."
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <br />
      <label id='joinlabel' htmlFor="roomIdInput">Enter Room ID:</label>
      <input
        type="text"
        id="joininput"
        placeholder="Enter Room ID..................."
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button id="joinRoom" onClick={handleJoin}>Join Room</button>
    </div>
  );
};

export default JoinRoom;