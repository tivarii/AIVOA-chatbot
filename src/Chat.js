import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Chat.css"; // Import the CSS file for styling

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prevMessages) => [
      ...prevMessages,
      { user: "User", text: userMessage, animationClass: "fade-in-user" },
    ]);
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/message", {
        userMessage,
      });

      setMessages((prev) => [
        ...prev,
        {
          user: "Bot",
          text: response.data.botResponse,
          animationClass: "fade-in-bot",
        },
      ]);
      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("http://localhost:5000/api/history");
        setMessages(
          response.data.map((msg) => ({
            user: msg.user_message ? "User" : "Bot",
            text: msg.user_message || msg.bot_response,
            animationClass: msg.user_message ? "fade-in-user" : "fade-in-bot",
          }))
        );
      } catch (err) {
        console.error("Error fetching chat history:", err);
        setError("Failed to load chat history. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="chat-container">
      <h2 className="chat-title">Chatbot</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.animationClass}`}>
            <strong className="message-user">{msg.user}:</strong>{" "}
            <span className="message-text">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          className="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chat;
