// ==Home.jsx ===
import {FaUserCircle} from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';

function Home() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedInUser(localStorage.getItem('loggedInUser'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    handleSuccess('User Logged out');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const fetchProducts = async () => {
    try {
      const url = "https://real-time-whiteboards-server-project.vercel.app/products";
      const headers = {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      };
      const response = await fetch(url, headers);
      const result = await response.json();
      console.log(result);
      setProducts(result);
    } catch (err) {
      handleError(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      minWidth: '100vw',
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      {/* Header */}
      <header style={{ 
        background: '#282c34', 
        padding: '10px 20px', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}> 
        <h2><FaUserCircle style={{ marginTop: '10px ', marginRight: '10px', fontSize: '35px', color:'white'}}/> Welcome, {loggedInUser}</h2>
        <button 
          onClick={handleLogout} 
          style={{ padding: '8px 16px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
      </header>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '150px', textAlign: 'center', alignItems: 'center' }}>
        <div id='Room'>
          <h2>Create a Whiteboard Session</h2>
          <CreateRoom/>
          <JoinRoom/>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#f1f1f1', 
        padding: '15px 20px', 
        textAlign: 'center' 
      }}>
        <p>&copy; {new Date().getFullYear()} Real-time Whiteboard Server App. All rights reserved.</p>
      </footer>

      <ToastContainer />
    </div>
  );
}

export default Home;


