import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/chat.css';

let socketInstance = null;

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const API = import.meta.env.VITE_BACKEND_URL;

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [showNudge, setShowNudge] = useState(false);
  const [unread, setUnread]     = useState(0);
  const [typing, setTyping]     = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimer = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── Connect socket when user logs in ──────────────────────────────────
  useEffect(() => {
    if (!user || user.role === 'admin') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Load existing history
    axios.get(`${API}/api/chat/history`).then(res => {
      setMessages(res.data);
    }).catch(() => {});

    // Show nudge after 2s if chat never opened
    const nudgeTimer = setTimeout(() => setShowNudge(true), 2000);

    // Connect socket
    socketInstance = io(`${API}`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      // Trigger first-open bot message if no history
      socketInstance.emit('user:firstOpen');
    });

    socketInstance.on('disconnect', () => setConnected(false));

    socketInstance.on('chat:message', (msg) => {
      setMessages(prev => {
        // avoid duplicates
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // If window is closed, increment unread
      setOpen(prev => {
        if (!prev && msg.role !== 'user') setUnread(u => u + 1);
        return prev;
      });
      // Show typing effect briefly for bot/admin
      if (msg.role !== 'user') {
        setTyping(false);
        clearTimeout(typingTimer.current);
      }
    });

    return () => {
      clearTimeout(nudgeTimer);
      if (socketInstance) { socketInstance.disconnect(); socketInstance = null; }
    };
  }, [user]);

  // Scroll on new messages
  useEffect(() => { scrollToBottom(); }, [messages, typing, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setUnread(0);
      setShowNudge(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !socketInstance) return;
    setInput('');
    socketInstance.emit('user:message', text);

    // Show typing indicator for a moment after user sends
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 4000);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Only render for logged-in non-admin users
  if (!user || user.role === 'admin') return null;

  return (
    <>
      {/* Nudge bubble */}
      {showNudge && !open && (
        <div className="chat-nudge" onClick={() => setOpen(true)} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
          <p>💬 <span>Ask us anything</span> — we're here to help!</p>
        </div>
      )}

      {/* Chat window */}
      {open && (
        <div className="chat-window">

          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-avatar">
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className="chat-header-info">
              <div className="chat-header-name">Alex Sterling Support</div>
              <div className="chat-header-status">
                <span className="chat-status-dot" style={{ background: connected ? '#1D9E75' : '#888' }} />
                {connected ? 'Online — we\'ll reply shortly' : 'Reconnecting...'}
              </div>
            </div>
            <button className="chat-header-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <div className="chat-empty-icon">
                  <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeWidth="1.5"/></svg>
                </div>
                <p>Send a message to get started.<br />We'll respond as soon as possible.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg._id} className={`chat-msg chat-msg--${msg.role}`}>
                {(msg.role === 'admin' || msg.role === 'bot') && (
                  <div className="chat-msg-sender">
                    {msg.role === 'bot' ? 'Support' : 'Support Team'}
                  </div>
                )}
                <div className="chat-msg-bubble">{msg.text}</div>
                <div className="chat-msg-meta">{formatTime(msg.createdAt)}</div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="chat-typing">
                <span /><span /><span />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || !connected}
            >
              <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        className={`chat-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle chat"
      >
        {unread > 0 && !open && (
          <span className="chat-trigger-badge">{unread}</span>
        )}
        {open ? (
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        )}
      </button>
    </>
  );
}
