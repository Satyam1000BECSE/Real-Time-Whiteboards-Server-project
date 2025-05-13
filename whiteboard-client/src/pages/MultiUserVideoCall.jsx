import React, { useEffect, useRef, useState } from 'react';

const MultiUserVideoCall = ({ roomId, socket }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const peersRef = useRef({});
  const userId = localStorage.getItem('loggedInUser');
  const localVideoRef = useRef();

  useEffect(() => {
    if (!roomId || !userId) return;

    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      setLocalStream(stream);
      socket.emit('join-room', { roomId, userId });
    };

    init();

    socket.on('user-joined', async ({ userId: newUserId }) => {
      const pc = createPeerConnection(newUserId);
      peersRef.current[newUserId] = pc;
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { offer, to: newUserId, from: userId });
    });

    socket.on('offer', async ({ from, offer }) => {
      const pc = createPeerConnection(from);
      peersRef.current[from] = pc;
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { answer, to: from, from: userId });
    });

    socket.on('answer', async ({ from, answer }) => {
      const pc = peersRef.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async ({ from, candidate }) => {
      const pc = peersRef.current[from];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate', err);
        }
      }
    });

    socket.on('user-left', (leftUserId) => {
      const pc = peersRef.current[leftUserId];
      if (pc) pc.close();
      delete peersRef.current[leftUserId];
      setRemoteStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[leftUserId];
        return newStreams;
      });
    });

    return () => {
      socket.emit('leave-call', { roomId, userId });
      Object.values(peersRef.current).forEach(pc => pc.close());
      peersRef.current = {};
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId, socket, userId, localStream]);

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', {
          to: peerId,
          from: userId,
          candidate: e.candidate
        });
      }
    };

    pc.ontrack = (e) => {
      setRemoteStreams(prev => ({
        ...prev,
        [peerId]: e.streams[0]
      }));
    };

    return pc;
  };

  const toggleMic = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraEnabled(videoTrack.enabled);
    }
  };

  const shareScreen = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = screenStream.getVideoTracks()[0];
    Object.values(peersRef.current).forEach(pc => {
      const sender = pc.getSenders().find(s => s.track.kind === 'video');
      if (sender) sender.replaceTrack(screenTrack);
    });

    screenTrack.onended = () => {
      const camTrack = localStream.getVideoTracks()[0];
      Object.values(peersRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track.kind === 'video');
        if (sender) sender.replaceTrack(camTrack);
      });
    };
  };

  const leaveCall = () => {
    socket.emit('leave-call', { roomId, userId });
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};
    setRemoteStreams({});
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    localVideoRef.current.srcObject = null;
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto', backgroundColor: '#f9f9f9', borderRadius: 10 }}>
      <h2>Multi-User Video Call</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <video ref={localVideoRef} autoPlay muted playsInline width={300} style={videoStyle} />
        {Object.entries(remoteStreams).map(([peerId, stream]) => (
          <video
            key={peerId}
            srcObject={stream}
            autoPlay
            playsInline
            width={300}
            style={videoStyle}
            ref={(video) => {
              if (video && stream) video.srcObject = stream;
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: 15, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={toggleMic} style={buttonStyle(micEnabled ? '#dc3545' : '#6c757d')}>
          {micEnabled ? 'Mute Mic' : 'Unmute Mic'}
        </button>
        <button onClick={toggleCamera} style={buttonStyle(cameraEnabled ? '#ffc107' : '#6c757d')}>
          {cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
        </button>
        <button onClick={shareScreen} style={buttonStyle('#17a2b8')}>Share Screen</button>
        <button onClick={leaveCall} style={buttonStyle('#343a40')}>Leave Call</button>
      </div>
    </div>
  );
};

const videoStyle = {
  borderRadius: '8px',
  border: '1px solid #ccc'
};

const buttonStyle = (bgColor) => ({
  padding: '10px 16px',
  backgroundColor: bgColor,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
});

export default MultiUserVideoCall;