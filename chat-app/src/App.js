// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [userUuid, setUserUuid] = useState('4caf6478-592b-4970-a45d-0c530920f341'); // Replace with your actual user UUID
  const [sessionId, setSessionId] = useState(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const REPLIT_BASE_URL = 'https://35bbeaf5-a4ce-4712-b55e-61d89ff58bb9-00-cxuw80lt4fu1.spock.replit.dev'; // Replace with your Replit URL

  useEffect(() => {
    // Start a new session when the component mounts
    const startSession = async () => {
      try {
        const response = await axios.post(`${REPLIT_BASE_URL}/api/user/startSession`, { user_uuid: userUuid });
        setSessionId(response.data.sessionId);
        setChatHistory([{ role: 'system', content: response.data.firstQuestion.question_text }]);
      } catch (error) {
        console.error('Error starting session:', error);
      }
    };

    startSession();
  }, [userUuid]);

  const sendMessage = async () => {
    if (message.trim() === '') return;

    // Add user's message to chat history
    setChatHistory([...chatHistory, { role: 'user', content: message }]);
    setMessage('');

    try {
      const response = await axios.post(`${REPLIT_BASE_URL}/api/chat/processMessage`, {
        sessionId,
        message,
        user_uuid: userUuid,
      });

      // Add AI's response to chat history
      setChatHistory([...chatHistory, { role: 'user', content: message }, { role: 'tutor', content: response.data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-history">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`chat-message ${chat.role}`}>
              <strong>{chat.role}:</strong> {chat.content}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
