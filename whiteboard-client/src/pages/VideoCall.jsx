// ======== Video Call ======


import React, { useEffect, useRef, useState } from 'react';

const VideoCall = ({ roomId, socket }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef();
  const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const userId = localStorage.getItem('loggedInUser');

  useEffect(() => {
    if (!userId || !roomId) return;

    socket.emit('join-room', { roomId, userId });

    socket.on('incoming-call', ({ from }) => {
      console.log('Incoming call from:', from);
      setIncomingCall(from);
    });

    socket.on('call-accepted', async ({ from }) => {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socket.emit('offer', { offer, toUserId: from, fromUserId: userId });
    });

    socket.on('offer', async ({ offer, from }) => {
      await createPeerConnection(from);
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit('answer', { answer, toUserId: from, fromUserId: userId });
    });

    socket.on('answer', async ({ answer }) => {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      if (candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ice candidate:', e);
        }
      }
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [socket, roomId, userId]);

  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const createPeerConnection = async (targetUserId) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', {
          candidate: e.candidate,
          toUserId: targetUserId || incomingCall,
        });
      }
    };

    const remoteStreamInstance = new MediaStream();
    setRemoteStream(remoteStreamInstance);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamInstance;

    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach((track) => {
        remoteStreamInstance.addTrack(track);
      });
    };

    pcRef.current = pc;

    const stream = await startMedia();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  };

  const startCall = async () => {
    setCallAccepted(true);
    await createPeerConnection();
    socket.emit('start-call', { roomId, fromUserId: userId });
  };

  const acceptCall = async () => {
    setCallAccepted(true);
    await createPeerConnection(incomingCall);
    socket.emit('accept-call', { fromUserId: userId, toUserId: incomingCall });
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      const sender = pcRef.current.getSenders().find((s) => s.track.kind === 'video');
      if (sender) {
        sender.replaceTrack(screenTrack);
      }

      screenTrack.onended = () => {
        const camTrack = localStream.getVideoTracks()[0];
        if (sender) sender.replaceTrack(camTrack);
      };
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const endCall = () => {
    pcRef.current?.close();
    pcRef.current = null;

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setCallAccepted(false);
    setIncomingCall(null);
    socket.emit('end-call', { userId, roomId });
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ marginBottom: '1px', color: '#333' }}>Video Call</h3>

      {!callAccepted && !incomingCall && (
        <button onClick={startCall} style={buttonStyle('#007bff', 'white')}>Start Video Call</button>
      )}

      {incomingCall && !callAccepted && (
        <div style={{ marginBottom: '10px' }}>
          <p>Incoming call from: <strong>{incomingCall}</strong></p>
          <button onClick={acceptCall} style={buttonStyle('#28a745', 'white')}>Accept</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
        <video ref={localVideoRef} autoPlay playsInline muted width={365} height={150} style={videoStyle} />
        <video ref={remoteVideoRef} autoPlay playsInline width={365}  height={150} style={videoStyle} />
      </div>

      {callAccepted && (
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={toggleMic} style={buttonStyle(micEnabled ? '#dc3545' : '#6c757d', 'white')}>
            {micEnabled ? 'Mute Mic' : 'Unmute Mic'}
          </button>
          <button onClick={toggleCamera} style={buttonStyle(cameraEnabled ? '#ffc107' : '#6c757d', 'black')}>
            {cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          </button>
          <button onClick={shareScreen} style={buttonStyle('#17a2b8', 'white')}>
            Share Screen
          </button>
          <button onClick={endCall} style={buttonStyle('#343a40', 'white')}>
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

// Styling
const containerStyle = {
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  maxWidth: '410px',
  margin: '20px auto',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f9f9f9',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const buttonStyle = (bgColor, color) => ({
  padding: '8px 14px',
  backgroundColor: bgColor,
  color: color,
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
});

const videoStyle = {
  borderRadius: '4px',
  border: '1px solid #ccc',
};

export default VideoCall;






   