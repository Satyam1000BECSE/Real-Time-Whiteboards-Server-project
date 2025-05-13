//=== src/pages/RoomPage.jsx ===

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Whiteboard from './whiteboards';

const RoomPage = () => {
    const { roomId } = useParams();
    const [loggedInUser, setLoggedInUser] = useState('');

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser'); // Correct key
        if (user) {
            setLoggedInUser(user);
        }
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <div id='headline'><h2  id='RooMHadline'>Welcome to Room</h2>
            <p id='RooMHadline'><strong>Room ID:</strong> {roomId}  </p>
            {loggedInUser && <p  id='RooMHadline'><strong>Logged in as:</strong> {loggedInUser}</p>}</div>
            <Whiteboard />
        </div>
    );
};

export default RoomPage;









