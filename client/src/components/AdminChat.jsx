import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import '../styles/chat.css';

let adminSocket = null;

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo]     = useState(null); // conversationId string
  const [activeName, setActiveName]       = useState('');
  const [messages, setMessages]           = useState([]);
  const [reply, setReply]                 = useState('');
  const [connected, setConnected]         = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Connect admin socket ───────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    adminSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    adminSocket.on('connect', () => setConnected(true));
    adminSocket.on('disconnect', () => setConnected(false));

    // New message arrives for any conversation
    adminSocket.on('chat:newMessage', ({ conversationId, senderName, text }) => {
      // Update conversation list preview
      setConversations(prev => {
        const exists = prev.find(c => c._id === conversationId);
        if (exists) {
          return prev.map(c =>
            c._id === conversationId
              ? { ...c, lastMessage: text, lastRole: 'user', unread: (c.unread || 0) + 1, senderName, lastTime: new Date() }
              : c
          );
        }
        return [{ _id: conversationId, senderName, lastMessage: text, lastRole: 'user', unread: 1, lastTime: new Date() }, ...prev];
      });

      // If this conversation is currently open, append the message
      setActiveConvo(current => {
        if (current === conversationId) {
          setMessages(prev => [...prev, {
            _id: Date.now().toString(),
            role: 'user',
            text,
            senderName,
            createdAt: new Date(),
          }]);
        }
        return current;
      });
    });

    // Message sent/received in the watched conversation
    adminSocket.on('chat:message', (msg) => {
      if (msg.role === 'admin') {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    // Load conversations on mount
    axios.get('/api/chat/conversations').then(res => setConversations(res.data)).catch(() => {});

    return () => { if (adminSocket) { adminSocket.disconnect(); adminSocket = null; } };
  }, []);

  // ── Open a conversation ────────────────────────────────────────────────
  const openConversation = async (convoId, name) => {
    setActiveConvo(convoId);
    setActiveName(name);
    setMessages([]);
    setReply('');

    // Tell server we're watching this convo for live updates
    if (adminSocket) adminSocket.emit('admin:watchConversation', convoId);

    // Load history
    try {
      const res = await axios.get(`/api/chat/conversation/${convoId}`);
      setMessages(res.data);
      // Clear unread count
      setConversations(prev =>
        prev.map(c => c._id === convoId ? { ...c, unread: 0 } : c)
      );
    } catch {}
  };

  // ── Send admin reply ───────────────────────────────────────────────────
  const sendReply = () => {
    const text = reply.trim();
    if (!text || !activeConvo || !adminSocket) return;
    setReply('');
    adminSocket.emit('admin:reply', { conversationId: activeConvo, text });
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

  return (
    <div>
      {/* Connection indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? '#1D9E75' : '#888', display: 'block' }} />
        <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '0.68rem', color: 'rgba(242,237,228,0.4)' }}>
          {connected ? 'Socket connected — live updates active' : 'Connecting...'}
        </span>
        {totalUnread > 0 && (
          <span style={{ marginLeft: 'auto', padding: '0.15rem 0.5rem', background: '#C0152A', color: '#fff', fontFamily: "'Montserrat',sans-serif", fontSize: '0.6rem', fontWeight: 700, borderRadius: 10 }}>
            {totalUnread} unread
          </span>
        )}
      </div>

      <div className="admin-chat-panel">

        {/* Sidebar — conversation list */}
        <div className="admin-chat-sidebar">
          <div className="admin-chat-sidebar-header">
            Conversations ({conversations.length})
          </div>
          <div className="admin-chat-list">
            {conversations.length === 0 && (
              <div style={{ padding: '1.5rem', fontFamily: "'Montserrat',sans-serif", fontSize: '0.7rem', color: 'rgba(242,237,228,0.25)', textAlign: 'center', fontStyle: 'italic' }}>
                No conversations yet
              </div>
            )}
            {conversations.map(c => (
              <div
                key={c._id}
                className={`admin-convo-item ${activeConvo === c._id ? 'active' : ''}`}
                onClick={() => openConversation(c._id, c.senderName)}
              >
                <div className="admin-convo-name">
                  {c.senderName || 'Unknown'}
                  {c.unread > 0 && (
                    <span className="admin-convo-unread">{c.unread}</span>
                  )}
                </div>
                <div className="admin-convo-preview">
                  {c.lastRole === 'user' ? '' : '↳ '}{c.lastMessage}
                </div>
                <div className="admin-convo-time">
                  {c.lastTime ? formatTime(c.lastTime) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main chat area */}
        <div className="admin-chat-main">
          {!activeConvo ? (
            <div className="admin-chat-empty">
              Select a conversation to view messages
            </div>
          ) : (
            <>
              <div className="admin-chat-main-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {activeName}
              </div>

              <div className="admin-chat-messages">
                {messages.map((msg, i) => (
                  <div key={msg._id || i} className={`chat-msg chat-msg--${msg.role}`}>
                    {(msg.role === 'admin' || msg.role === 'bot') && (
                      <div className="chat-msg-sender">
                        {msg.role === 'bot' ? 'Auto Reply' : 'You (Admin)'}
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div className="chat-msg-sender" style={{ color: 'rgba(242,237,228,0.45)' }}>
                        {msg.senderName}
                      </div>
                    )}
                    <div className="chat-msg-bubble">{msg.text}</div>
                    <div className="chat-msg-meta">{formatTime(msg.createdAt)}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="admin-chat-input-area">
                <textarea
                  className="admin-chat-input"
                  placeholder={`Reply to ${activeName}...`}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                />
                <button
                  className="admin-chat-send"
                  onClick={sendReply}
                  disabled={!reply.trim() || !connected}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
