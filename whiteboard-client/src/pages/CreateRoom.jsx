 // === src/components/CreateRoom.jsx ===   
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');

  const handleCreateRoom = async () => {
    try {
      const res = await axios.post('https://real-time-whiteboards-server-project.onrender.com/api/rooms/create', {
        userId,
      });
      const roomId = res.data.roomId;
      navigate(`/room/${roomId}?userId=${userId}`);
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label id='joinlabel' htmlFor="createUserId">Your Name / ID:</label>
      <input
        type="text"
        id="joininput"
        placeholder="Enter your Name/ID............."
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button id="createRoom" onClick={handleCreateRoom}>Create Room</button>
    </div>
  );
};



export default CreateRoom;



