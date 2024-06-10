// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [userUuid, setUserUuid] = useState('4caf6478-592b-4970-a45d-0c530920f341'); // Replace with your actual user UUID
  const [sessionId, setSessionId] = useState(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', answers: {} }); // State to store the current question
  const messageRef = useRef(null); // Reference to the message input


  const REPLIT_BASE_URL = 'https://35bbeaf5-a4ce-4712-b55e-61d89ff58bb9-00-cxuw80lt4fu1.spock.replit.dev:3001'; // Replace with your Replit URL

  useEffect(() => {
    // Start a new session when the component mounts
    const startSession = async () => {
      try {
        const response = await axios.post(`${REPLIT_BASE_URL}/api/user/startSession`, { user_uuid: userUuid });
        setSessionId(response.data.sessionId);
        setCurrentQuestion({
          text: response.data.firstQuestion.question_text,
          answers: response.data.firstQuestion.possible_answers || {},
        });
        setChatHistory([]);
      } catch (error) {
        console.error('Error starting session:', error);
      }
    };

    startSession();
  }, [userUuid]);

  const sendMessage = async () => {
    if (message.trim() === '') return;

    // Add user's message to chat history
    const newChatHistory = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newChatHistory);
    setMessage('');


    try {
      const response = await axios.post(`${REPLIT_BASE_URL}/api/chat/processMessage`, {
        sessionId,
        message,
        user_uuid: userUuid,
      });

      // Update new question if present
      if (response.data.nextQuestion) {
        setCurrentQuestion({
          text: response.data.nextQuestion.question_text,
          answers: response.data.nextQuestion.possible_answers || {},
        });
        setChatHistory([]); // Clear chat history for new question
      } else {
        // Add AI's response to chat history
        setChatHistory([...chatHistory, { role: 'user', content: message }, { role: 'tutor', content: response.data.response }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    // Adjust the height of the textarea to fit the content
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-history">
          {currentQuestion.text && (
            <div className="current-question">
              <div>{currentQuestion.text}</div>
              <ul>
                {Object.entries(currentQuestion.answers).map(([key, value]) => (
                  <li key={key}><strong>{key}:</strong> {value}</li>
                ))}
              </ul>
            </div>
          )}
          {chatHistory.map((chat, index) => (
            <div key={index} className={`chat-message ${chat.role}`}>
              {chat.content.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <textarea
            ref={messageRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            rows="1"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;