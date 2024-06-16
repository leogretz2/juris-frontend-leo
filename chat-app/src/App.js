// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { supabase } from './supabaseClient';
import AuthModal from './authModal';
import { Analytics } from '@vercel/analytics/react';

function App() {
  const [userUuid, setUserUuid] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', answers: {} }); // State to store the current question
  const [showAuthModal, setShowAuthModal] = useState(false);
  const messageRef = useRef(null); // Reference to the message input


  const REPLIT_BASE_URL = 'https://ai-tutor-backend-kappa.vercel.app/'; // Replace with your Replit URL

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setUserUuid(session?.user?.id ?? null);

      if (!session) {
        setShowAuthModal(true);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (userUuid) {
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
    }
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

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    const session = supabase.auth.session();
    setUserUuid(session?.user?.id ?? null);
  };


  return (
    <div className="App">
        {showAuthModal && <AuthModal onClose={handleAuthModalClose} />}
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
      <Analytics />
    </div>
  );
}

export default App;