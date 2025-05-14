//==== Poll page=====
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://real-time-whiteboards-server-project.onrender.com'); // Adjust to your server URL

export default function Poll({visible}) {
    if (!visible) return null;

  const [role, setRole] = useState(localStorage.getItem('role') || 'Student');
  const [pollVisible, setPollVisible] = useState(true);
  const [pollType, setPollType] = useState('question');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [votes, setVotes] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [timer, setTimer] = useState(30);
  const [startTimer, setStartTimer] = useState(false);
  const [correctOption, setCorrectOption] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('role', role);
  }, [role]);

  useEffect(() => {
    socket.on('pollData', data => {
      setQuestion(data.question);
      setOptions(data.options);
      setVotes(data.votes);
      setTimer(data.timer);
      setCorrectOption(data.correctOption);
      setStartTimer(data.startTimer);
      setHasVoted(false);
    });

    socket.on('voteUpdate', data => {
      setVotes(data.votes);
    });

    socket.on('timerUpdate', data => {
      setTimer(data.timer);
    });

    socket.on('correctOption', data => {
      setCorrectOption(data.index);
    });

    return () => {
      socket.off('pollData');
      socket.off('voteUpdate');
      socket.off('timerUpdate');
      socket.off('correctOption');
    };
  }, []);

  useEffect(() => {
    if (startTimer && timer > 0) {
      timerRef.current = setTimeout(() => {
        const newTime = timer - 1;
        setTimer(newTime);
        socket.emit('timerTick', { timer: newTime });
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [startTimer, timer]);

  const createPoll = () => {
    const pollData = {
      question,
      options,
      votes: {},
      timer: 30,
      correctOption: null,
      startTimer: true
    };
    socket.emit('createPoll', pollData);
  };

  const vote = (index) => {
    if (hasVoted || role !== 'Student') return;
    socket.emit('castVote', index);
    setHasVoted(true);
  };

  const markCorrect = (index) => {
    if (role === 'Representative') {
      socket.emit('markCorrect', index);
    }
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
       <div>
          <button
            onClick={() => setPollVisible(prev => !prev)}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Poll
          </button>

          {pollVisible && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                left: '50px',
                zIndex: 10,
                width: '600px',
                background: '#f9f9f9',
                border: '2px solid #ccc',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '20px',
                borderRadius: '12px',
                pointerEvents: 'auto',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              <div style={{ marginBottom: '15px' }}>
                <label style={{ marginRight: '10px' }}>Role:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                >
                  <option value="Student">Student</option>
                  <option value="Representative">Representative</option>
                </select>
              </div>

              {role === 'Representative' && (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ marginRight: '10px' }}>Type:</label>
                    <select
                      value={pollType}
                      onChange={(e) => setPollType(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    >
                      <option value="question">Question + Options</option>
                      <option value="options">Options Only</option>
                    </select>
                  </div>

                  {pollType === 'question' && (
                    <input
                      value={question}
                      onChange={e => setQuestion(e.target.value)}
                      placeholder="Enter question"
                      style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '10px',
                        borderRadius: '6px',
                        border: '1px solid #ccc'
                      }}
                    />
                  )}

                  {options.map((opt, i) => (
                    <input
                      key={i}
                      value={opt}
                      onChange={e => {
                        const updated = [...options];
                        updated[i] = e.target.value;
                        setOptions(updated);
                      }}
                      placeholder={`Option ${i + 1}`}
                      style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ccc'
                      }}
                    />
                  ))}

                  <button
                    onClick={() => setOptions([...options, ''])}
                    style={{
                      marginRight: '10px',
                      padding: '8px 12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Option
                  </button>

                  <button
                    onClick={createPoll}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ffc107',
                      color: 'black',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    Start Poll
                  </button>
                </>
              )}

              {(startTimer || totalVotes > 0) && (
                <>
                  {pollType === 'question' && <h4 style={{ marginTop: '20px' }}>{question}</h4>}

                  {options.map((opt, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                      <button
                        onClick={() => vote(i)}
                        disabled={hasVoted || role !== 'Student' || timer === 0}
                        style={{
                          width: '100%',
                          backgroundColor: correctOption === i ? '#d4edda' : 'white',
                          border: '1px solid #aaa',
                          padding: '10px',
                          borderRadius: '6px',
                          cursor: hasVoted || role !== 'Student' || timer === 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                      {totalVotes > 0 && (
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          {((votes[i] || 0) / totalVotes * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  ))}

                  {role === 'Representative' && (
                    <div style={{ marginTop: '15px' }}>
                      <h5>Mark Correct Answer</h5>
                      {options.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => markCorrect(i)}
                          style={{
                            margin: '4px',
                            padding: '6px 10px',
                            backgroundColor: correctOption === i ? '#28a745' : '#f0f0f0',
                            color: correctOption === i ? 'white' : 'black',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '15px', fontWeight: 'bold' }}>
                    Time Left: {timer}s
                  </div>

                  {totalVotes > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <h5>Leaderboard</h5>
                      {Object.entries(votes)
                        .sort((a, b) => b[1] - a[1])
                        .map(([i, count]) => (
                          <div key={i}>
                            {options[i]} - {count} vote{count !== 1 ? 's' : ''}
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
  );
}
