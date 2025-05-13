// ======= App.jsx ======

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Whiteboard from './pages/whiteboards';
import Register from './pages/Register';
import Login from './pages/Login';
import LandingPage from './pages/Landingpage';
import { useState } from 'react';
import RefreshHandler from './RefreshHandler';
import JoinRoom from './pages/JoinRoom';
import CreateRoom from './pages/CreateRoom';
import RoomPage from './pages/RoomPage'

// app.use(express.json());


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const PrivateRoute = ({element})=>{
    return isAuthenticated ? element : <Navigate to="/login"/>;
  };
  
  return (
    <div>
      <Router>
        <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
        <Routes>
          {/* <Route path='/' element={<Navigate to="/login"/>}/> */}
          <Route path='/' element={<LandingPage/>}/>
          <Route path="/home" element={<PrivateRoute element={<Home/>}/>} />
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path="/join/:sessionId" element={<Whiteboard />} />  
          <Route path="/createroom" element={<><CreateRoom /><JoinRoom /></>} /> 
          <Route path='room/:roomId' element={<RoomPage/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;