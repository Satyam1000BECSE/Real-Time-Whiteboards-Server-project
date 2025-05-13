//===Landing Page====
import React, { useEffect, useState } from 'react';

const studyImages = [
  "https://images.unsplash.com/photo-1584697964403-c52b6a4f1ee5",
  "https://images.unsplash.com/photo-1555967529-76bfbba8f1a4",
  "https://images.unsplash.com/photo-1517524285303-d6fc683dddf8",
  "https://images.unsplash.com/photo-1498079022511-d15614cb1c02",
  "https://images.unsplash.com/photo-1550439062-609e1531270e",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754",
  "https://images.unsplash.com/photo-1587614382346-ac5ce068fe85",
  "https://images.unsplash.com/photo-1603575242441-53a63b232174",
  "https://images.unsplash.com/photo-1596495578064-4e4c3f4925d6",
  "https://images.unsplash.com/photo-1596496050236-3b0b56ccf107",
  "https://images.unsplash.com/photo-1611048267454-938bc30f0db4",
  "https://images.unsplash.com/photo-1610878180933-c942d0db93d0",
  "https://images.unsplash.com/photo-1590608897129-79e7d34f7f36"
];


function LandingPage() {
  const [bgImageIndex, setBgImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgImageIndex((prevIndex) => {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * studyImages.length);
        } while (nextIndex === prevIndex); // ensure not same as before
        return nextIndex;
      });
    }, 3000); // change every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const bgImage = studyImages[bgImageIndex];
  const containerStyle = {
    minHeight: '100vh',
    minWidth: '100vw',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontFamily: 'Arial, sans-serif',
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'background-image 1s ease-in-out',
    color: 'black',
  };

  const overlayStyle = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle = {
    background: '#282c34', 
        padding: '10px 20px', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
  };

  const navStyle = {
    display: 'flex',
    gap: '15px',
  };

  const linkStyle = {
    padding: '8px 16px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px'
  };

  const mainTextStyle = {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2rem',
    textAlign: 'center',
    padding: '0 20px',
  };

  const footerStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '15px 20px',
    textAlign: 'center',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="https://img.icons8.com/ios-filled/50/ffffff/whiteboard.png"
              alt="Whiteboard Icon"
              style={{ width: 32, height: 32 }}
            />
            <h2>Real-time Whiteboard Server</h2>
          </div>
          <nav style={navStyle}>
            <a href="/home" style={linkStyle}>Home</a>
            <a href="/login" style={linkStyle}>Login</a>
            <a href="/register" style={linkStyle}>Register</a>
          </nav>
        </header>

        {/* Main Text */}
        <main style={mainTextStyle}>
          <h1>Welcome to the Real-time Whiteboard Server</h1>
        </main>

        {/* Footer */}
        <footer style={footerStyle}>
          &copy; {new Date().getFullYear()} Real-time whiteboard server – All rights reserved
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;

