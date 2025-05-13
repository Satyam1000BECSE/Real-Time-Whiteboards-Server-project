function UserHelp() {
    const helpTopics = [
      { title: "How to create an account?", text: "Click on the Sign Up button and fill in your details." },
      { title: "How to join a room?", text: "Go to the Session page and enter a valid Room ID." },
      { title: "How to use whiteboard tools?", text: "Use the toolbar on the left to draw, add shapes, and write." },
      { title: "Can I invite others?", text: "Yes, copy and share your Room ID or session link." },
    ];
  
    return (
      <div style={{ fontSize: '14px' }}>
        <h3>Help Topics</h3>
        <ul>
          {helpTopics.map((item, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }