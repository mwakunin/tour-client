"use client";

import { useState } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! 👋 Welcome to Footloose Adventures!\n\nI can help you with tours, pricing, and bookings!",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [dynamicReplies, setDynamicReplies] = useState<string[]>([]);

  // Persistent quick replies - always show these
  const persistentReplies = ["Show tours", "Pricing", "Contact"];

  // Relative so it resolves against whatever origin the app is served from and
  // goes through the /api/* rewrite. Was hardcoded to the .co.ke apex, which
  // does not serve this app.
  const WEBHOOK_URL = "/api/chat";

  const sendMessage = async (message?: string) => {
    const messageToSend = message || inputValue.trim();
    if (!messageToSend) return;

    // Add user message
    setMessages((prev) => [...prev, { text: messageToSend, sender: "user" }]);
    setInputValue("");

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          name: "Visitor",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = Array.isArray(data) ? data[0] : data;

      // Add bot response
      setMessages((prev) => [...prev, { text: botResponse.reply, sender: "bot" }]);

      // Update dynamic quick replies (shown above persistent ones)
      if (botResponse.quickReplies && botResponse.quickReplies.length > 0) {
        setDynamicReplies(botResponse.quickReplies);
      } else {
        setDynamicReplies([]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, something went wrong. Please try again!",
          sender: "bot",
        },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="safari-chat-widget">
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle chat">
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>🦁 Footloose Adventures</h3>
            <p>Your Safari Adventure Awaits</p>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.sender === "user" ? "user-message" : "bot-message"}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="quick-replies-container">
            {/* Dynamic replies from bot response */}
            {dynamicReplies.length > 0 && (
              <div className="quick-replies dynamic">
                {dynamicReplies.map((reply, idx) => (
                  <button key={idx} onClick={() => sendMessage(reply)} className="dynamic-btn">
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Persistent main actions - always visible */}
            <div className="quick-replies persistent">
              {persistentReplies.map((reply, idx) => (
                <button key={idx} onClick={() => sendMessage(reply)} className="persistent-btn">
                  {reply}
                </button>
              ))}
            </div>
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
            />
            <button onClick={() => sendMessage()}>➤</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .safari-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .chat-toggle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: oklch(0.7 0.18 65); /* African sunset orange */
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-toggle:hover {
          transform: scale(1.1);
          background: oklch(0.65 0.2 65);
        }

        .chat-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          height: 550px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-header {
          background: linear-gradient(135deg, oklch(0.7 0.18 65) 0%, oklch(0.75 0.15 75) 100%);
          color: white;
          padding: 20px;
          text-align: center;
        }

        .chat-header h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
        }

        .chat-header p {
          margin: 0;
          font-size: 13px;
          opacity: 0.9;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f5f5f5;
        }

        .bot-message,
        .user-message {
          margin-bottom: 12px;
          padding: 12px 16px;
          border-radius: 16px;
          max-width: 80%;
          word-wrap: break-word;
          white-space: pre-wrap;
          animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .bot-message {
          background: white;
          color: #333;
          margin-right: auto;
          border: 1px solid oklch(0.922 0 0);
        }

        .user-message {
          background: oklch(0.7 0.18 65);
          color: white;
          margin-left: auto;
          text-align: right;
        }

        .quick-replies-container {
          background: #f5f5f5;
          border-top: 1px solid oklch(0.922 0 0);
        }

        .quick-replies {
          padding: 10px 15px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .quick-replies.dynamic {
          border-bottom: 1px solid oklch(0.922 0 0);
        }

        .quick-replies button {
          padding: 8px 14px;
          border-radius: 16px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
          font-weight: 500;
        }

        /* Dynamic replies - contextual actions */
        .dynamic-btn {
          background: white;
          border: 2px solid oklch(0.7 0.18 65);
          color: oklch(0.7 0.18 65);
        }

        .dynamic-btn:hover {
          background: oklch(0.7 0.18 65);
          color: white;
        }

        /* Persistent replies - main navigation */
        .persistent-btn {
          background: oklch(0.97 0 0);
          border: 1px solid oklch(0.922 0 0);
          color: oklch(0.145 0 0);
        }

        .persistent-btn:hover {
          background: oklch(0.75 0.15 75);
          color: white;
          border-color: oklch(0.75 0.15 75);
        }

        .chat-input-area {
          padding: 15px;
          background: white;
          border-top: 1px solid oklch(0.922 0 0);
          display: flex;
          gap: 10px;
        }

        .chat-input-area input {
          flex: 1;
          padding: 10px 15px;
          border: 2px solid oklch(0.922 0 0);
          border-radius: 20px;
          outline: none;
          font-size: 14px;
        }

        .chat-input-area input:focus {
          border-color: oklch(0.7 0.18 65);
        }

        .chat-input-area button {
          width: 40px;
          height: 40px;
          background: oklch(0.7 0.18 65);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .chat-input-area button:hover {
          background: oklch(0.65 0.2 65);
        }

        @media (max-width: 480px) {
          .chat-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 100px);
            bottom: 80px;
            right: 20px;
          }
        }
      `}</style>
    </div>
  );
}
