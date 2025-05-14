// ============== Whiteboard page ========
import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {io} from 'socket.io-client';
import VideoCall from './VideoCall';
import Poll from "./Poll"; 


const userId = localStorage.getItem('userId');

const socket = io('https://real-time-whiteboards-server-project.onrender.com');



const Whiteboard = () => {
   
  // poll tool
  const [pollVisible, setPollVisible] = useState(false);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [tool, setTool] = useState('pencil');
  const { roomId } = useParams();
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const navigate = useNavigate();
  const startPoint = useRef({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  
  // eslint-disable-next-line no-unused-vars
  const [pages, setPages] = useState([[]]);
  const [currentPage, setCurrentPage] = useState(0);
  // const [objects, setObjects] = useState([]);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  
  // eslint-disable-next-line no-unused-vars
  const [lineWidth, setLineWidth] = useState(2);
  

  
  useEffect(() => {
    if (!roomId) {
      const newRoomId = Math.random().toString(36).substring(2, 10);
      navigate(`/room/${newRoomId}`);
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.74;
    canvas.height = window.innerHeight * 0.82;
    canvas.style.width = `${window.innerWidth * 0.74}px`;
    canvas.style.height = `${window.innerHeight * 0.82}px`;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctxRef.current = ctx;

    // Save initial blank state
    setHistory([canvas.toDataURL()]);

    socket.emit('join-room', roomId);

    // When a new user joins, share current canvas state
    socket.on('request-canvas-state', () => {
      const image = canvas.toDataURL();
      socket.emit('send-canvas-state', { roomId, image });
    });

    socket.on('receive-canvas-state', ({ image }) => {
      const img = new Image();
      img.onload = () => ctxRef.current.drawImage(img, 0, 0);
      img.src = image;
    });

    

    const handleRemoteDraw = (data) => {
      const drawCtx = ctxRef.current;
      if (data.tool === 'pencil' || data.tool === 'eraser') {
        drawCtx.strokeStyle = data.color;
        drawCtx.lineWidth = data.lineWidth || 2;
        drawCtx.beginPath();
        drawCtx.moveTo(data.start.x, data.start.y);
        drawCtx.lineTo(data.end.x, data.end.y);
        drawCtx.stroke();
        drawCtx.closePath();
      } else {
        drawShape(data.tool, data.start, data.end);
      }
    };

    socket.on('add-text', ({ text, x, y, color}) => {
      const ctx = ctxRef.current;
      ctx.font = '20px Arial';
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    });

    // socket.on('change-page', ({ page}) => {
    //   setCurrentPage(page);
    //   ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    // });

    const handleReceivedImage = (imageData) => {
      drawImage(imageData);
      setHistory((prev) => [...prev, imageData]);
    };

    socket.on("receive-image", handleReceivedImage);
    socket.on('drawing', handleRemoteDraw);
    socket.on('clear-canvas', clearCanvas);
    
    socket.on('undo', ({ image }) =>{
      loadImage(image);
      setHistory((prev) => [...prev.slice(0, -1)]);
      setRedoHistory((prev) => [...prev, image]);
    });

    socket.on('redo', ({ image }) => {
      loadImage(image);
      setHistory((prev) => [...prev, image]);
      setRedoHistory((prev) => prev.slice(0, -1));
    });

    socket.on('canvasUpdate' , ({image}) =>{
      loadImage(image);
    });
    // socket.on('receive-canvas-state', ({ image }) => loadImage(image));
    // socket.on('upload-image', ({ image}) => { drawImage(image);});
    socket.on("receive-chat", (msg) => setChat(prev => [...prev, msg]));

    return () => {
      socket.off('drawing', handleRemoteDraw);
      socket.off("receive-image", handleReceivedImage);
      socket.off('clear-canvas');
      socket.off('canvasUpdate');
      socket.off('undo');
      socket.off('redo');
      socket.off('upload-image');
      // socket.off('receive-canvas-state');
      socket.off('add-text');
      socket.off("receive-chat");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, navigate]);

  // poll tool
 


  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
    }
  }, [color]);
  
  // For load canvas Image
  const loadImage = (dataURL) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataURL;
  };



  const startDrawing = ({ nativeEvent }) => {
  const { offsetX, offsetY } = nativeEvent;

  // Save current state before starting new drawing
  const image = canvasRef.current.toDataURL();
  setHistory(prev => [...prev, image]);
  setRedoHistory([]); // clear redo stack on new draw

  startPoint.current = { x: offsetX, y: offsetY };
  setIsDrawing(true);
  if (tool === 'pencil' || tool === 'eraser') {
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
  }
};
  
  // draw pencil Tool 
  const draw = ({ nativeEvent }) => {
    if (!isDrawing || (tool !== 'pencil' && tool !== 'eraser')) return;
    const { offsetX, offsetY } = nativeEvent;
    const strokeColor = tool === 'eraser' ? '#fff' : color;
    const lw = tool === 'eraser' ? 15 : lineWidth;
    ctxRef.current.strokeStyle = strokeColor;
    ctxRef.current.lineWidth = lw;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
    socket.emit('drawing', {
      roomId,
      tool,
      start: startPoint.current,
      end: { x: offsetX, y: offsetY },
      color: strokeColor,
      lineWidth: lw,
    });
    startPoint.current = { x: offsetX, y: offsetY };
  };

  // Handle to stop and draw pencil 
  const endDrawing = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    if (tool !== 'pencil' && tool !== 'eraser') {
      drawShape(tool, startPoint.current, { x: offsetX, y: offsetY });
      socket.emit('drawing', {
        roomId,
        tool,
        start: startPoint.current,
        end: { x: offsetX, y: offsetY },
        color,
      });
    }
    setIsDrawing(false);
    ctxRef.current.beginPath();
  };

  // Draw All Shapes Tools
  const drawShape = (tool, start, end) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.strokeStyle = color;
    switch (tool) {
      case 'line':
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        break;
      case 'arrow': {
        const headLength = 10;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
        break;
      }
      case 'rectangle':
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;
      case 'circle': {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        break;
      }
      case 'curve':
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo((start.x + end.x) / 2, start.y - 50, end.x, end.y);
        break;
      case 'triangle':
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.lineTo(start.x - (end.x - start.x), end.y);
        ctx.closePath();
        break;
      default:
        break;
    }
    ctx.stroke();
  };

  const drawImage = (imageData) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageData;
  };

  //  Clear Canvas Screen tool
  const clearCanvas = () => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleClear = () => {
    clearCanvas();
    socket.emit('clear-canvas', roomId);
    // const image = canvasRef.current.toDataURL();
    setHistory([]);
    setRedoHistory([]);
  };

  // Pencil and other Newtool select
  const handleToolChange = (newTool) => setTool(newTool);

  // Color Change Tool
  const handleColorChange = (e) => setColor(e.target.value);

  // Undo Tool
  const handleUndo = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const lastState = newHistory.pop();
    setRedoHistory((prev) => [...prev, lastState]);
    setHistory(newHistory);
    const prevImage = newHistory[newHistory.length - 1] || '';
    loadImage(prevImage);
      socket.emit('undo', { roomId, image: prevImage });
  };

  // Redo Tool
  const handleRedo = () => {
    if (redoHistory.length === 0) return;

    const nextImage = redoHistory[redoHistory.length - 1];
    setRedoHistory(prev => prev.slice(0, -1));
    setHistory(prev => [...prev, nextImage]);

    loadImage(nextImage);
    socket.emit('redo', { roomId, image: nextImage });
  };

  // Upload file tool
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result;
      drawImage(imageData);
      setHistory((prev) => [...prev, imageData]);
      socket.emit('upload-image', { roomId, imageData });
    };
    reader.readAsDataURL(file);
  };

  // New page Tool
  const handleNewPage = () => {
    clearCanvas();
    setHistory([]);
    setRedoHistory([]);
    socket.emit('clear-canvas', roomId);
  };

  // Download Tool
  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };
   

  // ZoomIn or ZoomOut
  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Add text box
  const addTextBox   = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const input = document.createElement("input");
      input.row = 1;
      input.type = "text";
      input.placeholder = "Type and press Enter";
      input.style.position = "absolute";
      input.style.left = `${rect.left + x}px`;
      input.style.top = `${rect.top + y}px`;
      input.style.font = "20px Arial";
      input.style.color = color;
      input.style.border = "1px solid #ccc";
      input.style.background = "white";
      input.style.padding = "2px";
      input.style.zIndex = 1000;

      document.body.appendChild(input);
       input.focus();

      const handleEnter = (event) => {
        if (event.key === "Enter") {
          const text = input.value.trim();
          if (text) {
            ctx.font = "20px Arial";
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);

            socket.emit("add-text", { roomId, text, x, y, color });
          }
          document.body.removeChild(input);
          input.removeEventListener("keydown", handleEnter);
          canvas.removeEventListener("click", handleClick);
        }
      };

      input.addEventListener("keydown", handleEnter); 
    };
      
    canvas.addEventListener("click", handleClick, { once: true});
  };

  // Next Page Tool
  const nextPage = () => {
  setPages(prev => {
    const newPages = [...prev, []];
    setCurrentPage(newPages.length - 1);
    clearCanvas();
    setHistory([]);
    setRedoHistory([]);
    socket.emit('clear-canvas', roomId); // Optionally emit a page change too
    return newPages;
  });
};
 
  // Prev Page Tool
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => {
        const newPage = prev - 1;
        socket.emit('change-page', { roomId, page: newPage});
        return newPage;
      });
      clearCanvas();
    }
  };

  // Send message chat - box tool
  const sendMessage = () => {
    socket.emit("send-chat", message);
    setMessage("");
  };
  
  
  

  return (
    <div style={{ padding: '0px 15px', fontFamily: 'Arial, sans-serif', width:'100vw' , height: '100vh'  }}>

  {/* Toolbar on top full-width */}
  
  <div className="Toolbar" style={{
    padding: '7px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexWrap: 'wrap',
    width: '98vw',
    height: '10vh',
    gap: '10px',
    marginBottom: '15px',
    alignItems: 'center'
  }}>
    
    {/* [Toolbar content unchanged] */}
    <select onChange={(e) => handleToolChange(e.target.value)} value={tool} style={{ marginLeft: '15px', padding: '3px' ,height: '30px', width:'85px' }}>
      <option value="pencil">✏️Pencil</option>
      <option value="eraser">Eraser</option>
      <option value="line">Line</option>
      <option value="arrow">Arrow Line</option>
      <option value="rectangle">Rectangle</option>
      <option value="circle">Circle</option>
      <option value="curve">Curve</option>
      <option value="triangle">Triangle</option>
    </select>
    <input type="color" value={color} onChange={handleColorChange} style={{ width: '50px', height: '25px' }} />
    <button onClick={handleClear} style={{ padding: '5px 5px' }}>🧹Clear</button>
    <button onClick={handleUndo} style={{ padding: '5px 10px' }}>↩️Undo</button>
    <button onClick={handleRedo} style={{ padding: '5px 10px' }}>↪️Redo</button>
    <input type="file" accept="image/*" onChange={handleUpload} style={{ padding: '5px' }} />
    <button onClick={handleNewPage} style={{ padding: '5px 10px' }}>📄New Page</button>
    <button onClick={handleDownload} style={{ padding: '5px 10px' }}>⬇️Download</button>
    <button onClick={zoomIn} style={{ padding: '5px 10px' }}>➕Zoom In</button>
    <button onClick={zoomOut} style={{ padding: '5px 10px' }}>➖Zoom Out</button>
    <button onClick={addTextBox} style={{ padding: '5px 10px' }}>🔤Text Box</button>
    <button onClick={nextPage} style={{ padding: '5px 10px' }}>➡️Next Page</button>
    <button onClick={prevPage} style={{ padding: '5px 10px' }}>⬅️Previous Page</button>
    <select onChange={(e) => setLineWidth(Number(e.target.value))} style={{ padding: '3px', height: '25px', width:'75px'}}>
      <option value="2">Thin</option>
      <option value="5">Medium</option>
      <option value="10">Thick</option>
    </select>
    <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={e => setLineWidth(Number(e.target.value))}
    />
    {/* Header with Poll Button */}
      <div className='whiteboard-header' style={{ padding: '3px', background: '#eee', display: 'flex', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setPollVisible(prev => !prev)}>Poll</button>
        {/* Add other header buttons here */}
      </div>

          {/* <div> <h3>Role: </h3> <select value={role} onChange={(e) => setRole(e.target.value)}> <option value="student">Student</option> <option value="representative">Representative</option> </select> <Poll onToolSelect={handleToolSelect} /> <canvas ref={canvasRef} width={200} height={200} style={{ border: "1px solid black" }} onClick={handleCanvasClick} ></canvas> {selectedTool === "poll" && role === "representative" && ( <PollTool onSubmit={handleCreatePollOnCanvas} /> )} {timeLeft !== null && !activePoll?.votingEnded && ( <p>Voting ends in: {timeLeft}s</p> )} </div>  */}
  </div>

  

  {/* Main content split into left and right columns */}
  <div style={{ display: 'flex', gap: '20px' }}>
    
    {/* Left column: VideoCall and Chat */}
    <div style={{ width: '455px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ height: '500px', border: '1px solid #ccc', padding: '10px', backgroundColor: '#f1f1f1' }}>
        <VideoCall roomId={roomId} userId={userId} socket={socket} />
        {/* <MultiUserVideoCall/> */}
      </div>

      <div className="chat-box" style={{
        border: '1px solid #ccc',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        flex: 1
      }}>
        <div style={{
          height: '140px',
          overflowY: 'scroll',
          border: '1px solid gray',
          padding: '5px',
          marginBottom: '10px',
          backgroundColor: '#fff'
        }} className="chat-messages">
          {chat.map((msg, i) => <div key={i}>{msg}</div>)}
        </div>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message"
          style={{ width: '70%', padding: '5px', marginRight: '5px' }}
        />
        <button onClick={sendMessage} style={{ padding: '5px 10px', backgroundColor: '#0f0' }}>Send</button>
      </div>
    </div>

    {/* Right column: Canvas */}

      <div style={{ position: 'relative', width: '1000px', height: '600px' }}>
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          style={{
            border: '1px solid #000',
            cursor: 'crosshair',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            backgroundColor: '#fff',
            zIndex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        
        {/* Poll rendered over canvas */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1000px',
          height: '600px',
          pointerEvents: 'none', // Let drawing through except where poll box appears
          zIndex: 1
        }}>
          <Poll visible={pollVisible}/>
        </div>
      </div>
  </div>
</div>
  );
};

export default Whiteboard;



