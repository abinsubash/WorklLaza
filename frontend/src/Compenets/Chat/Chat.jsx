import { useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import { Paperclip, Send, X, ArrowBarRight, ArrowBarLeft } from "react-bootstrap-icons";
import "./Chat.css";
import API from '../../api'
import user_icone from '../../assets/user.png'
import logo from '../../assets/logo.png'
import secureRequest from "../ProtectedRoute/secureRequest";
import { toast } from 'sonner';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeReceiver, setActiveReceiver] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [socket, setSocket] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const { user_id } = useSelector((state) => state.auth);
  const [sidebar, setSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const VITE_WEBSOCKET_CHAT_URL = import.meta.env.VITE_WEBSOCKET_CHAT_URL || 'ws://localhost:8000/ws/chat/';

  const fetchData = async (chatReceiverId = null) => {
    try {
      setPageLoading(true);
      setConnectionError(false);
      
      chatReceiverId = chatReceiverId == null ? localStorage.getItem("chatReceiverId") : chatReceiverId;
      
      if (!chatReceiverId || chatReceiverId === 'undefined') {
        console.error("No valid chat receiver ID provided");
        toast.error("Please select a conversation");
        setPageLoading(false);
        return;
      }

      await secureRequest(async () => {
        const res = await API.post(`/chat/get_chats/`, { 
          "user_id": user_id, 
          "chatReceiverId": chatReceiverId 
        });

        setChatRooms(res?.data?.chats || []);
        setActiveReceiver(res?.data?.receiver);
        setMessages(res?.data?.messages || []);
        localStorage.setItem("chatReceiverId", chatReceiverId);

        const chatRoomId = res?.data?.chat_id;
        if (chatRoomId) {
          await openChat(chatRoomId);
        } else if (res?.data?.chats?.length > 0) {
          await openChat(res.data.chats[0].id);
        }
      });
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats");
      setConnectionError(true);
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 15000); // Refresh chat list every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const openChat = async (chatRoomId) => {
    if (!chatRoomId || chatRoomId === 'undefined') {
      console.warn("⚠️ Invalid Chat Room ID:", chatRoomId);
      toast.error("Invalid chat room. Please try again.");
      return;
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    localStorage.setItem("chatRoomId", chatRoomId);
    setConnectionError(false);

    const wsUrl = `${VITE_WEBSOCKET_CHAT_URL}${chatRoomId}/`;
    console.log("Connecting to WebSocket:", wsUrl);

    try {
      const newWs = new WebSocket(wsUrl);

      newWs.onopen = () => {
        console.log("✅ WebSocket Connected to room:", chatRoomId);
        setConnectionError(false);
      };

      newWs.onerror = (e) => {
        console.error("❌ WebSocket Error:", e);
        setConnectionError(true);
        toast.error("Connection error. Please refresh the page.");
      };

      newWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prev) => {
            const messageExists = prev.some(
              msg => msg.timestamp === data.timestamp && msg.sender === data.sender
            );
            if (!messageExists) {
              return [...prev, { 
                sender: data.sender, 
                text: data.message, 
                timestamp: data.timestamp, 
                image: data.image || null,
                id: `${data.timestamp}-${data.sender}`
              }];
            }
            return prev;
          });
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      newWs.onclose = () => {
        console.log("⚠️ WebSocket Disconnected");
      };

      socketRef.current = newWs;
      setSocket(newWs);
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setConnectionError(true);
      toast.error("Failed to connect to chat");
    }
  };

  const sendMessage = async () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Not connected to chat. Please refresh.");
      return;
    }

    if (!message.trim() && !selectedImage) {
      return;
    }

    try {
      await secureRequest(async () => {
        socketRef.current.send(JSON.stringify({
          message: message.trim() || null,
          sender: user_id,
          image: selectedImage || null
        }));
        setMessage("");
        setSelectedImage(null);
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  function extractTime(timestampString) {
    try {
      const date = new Date(timestampString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return "00:00";
    }
  }

  const toggleSidebar = () => {
    setSidebar(!sidebar);
  }

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  if (pageLoading) {
    return (
      <div className="chat-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          <div>Loading chats...</div>
        </div>
      </div>
    );
  }

  if (!chatRooms || chatRooms.length === 0) {
    return (
      <div className="chat-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#999',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div>
            <div style={{ fontSize: '14px', marginBottom: '10px' }}>No chats available</div>
            <div style={{ fontSize: '12px' }}>Start a booking to chat with an admin or worker</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className={`chat-sidebar ${sidebar ? "chat-sidebar-open" : "chat-sidebar-closed"}`}>
        <div className="sidebar-header">
          💬 Chats
        </div>
        <div className="users-list">
          {chatRooms?.map(chatRoom => {
            const opponent = chatRoom?.user2_profile?.id == user_id ? chatRoom?.user1_profile : chatRoom?.user2_profile;
            if (!opponent) return null;
            
            const isActive = opponent?.id === activeReceiver?.id;
            return (
              <div 
                key={chatRoom.id} 
                className={`user-item ${isActive ? 'active' : ''}`} 
                onClick={() => {
                  fetchData(opponent?.id);
                  setSidebar(false);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="avatar-container">
                  {opponent.is_superuser ? (
                    <img src={logo} alt="Admin" style={{ borderRadius: "0%" }} className="user-avatar" />
                  ) : opponent?.profile_picture ? (
                    <img src={opponent?.profile_picture} alt={opponent?.first_name} className="user-avatar" />
                  ) : (
                    <img src={user_icone} alt={opponent?.first_name} className="user-avatar" />
                  )}
                  {opponent?.active && <span className="status-indicator"></span>}
                </div>
                <div className="user-details">
                  <span className="user-name">
                    {opponent.is_superuser ? "🔐 Admin Support" : `${opponent?.first_name || ""} ${opponent?.last_name || ""}`}
                  </span>
                  {opponent?.unread > 0 && (
                    <span className="unread-badge">{opponent.unread}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <button className="side_bar_togle" onClick={toggleSidebar} title="Toggle sidebar">
        {sidebar ? <ArrowBarLeft fontSize={25} /> : <ArrowBarRight fontSize={25} />}
      </button>
      
      <div className={`chat-main ${sidebar ? 'chat-main-closed' : 'chat-main-open'}`}>
        {activeReceiver ? (
          <>
            <div className="chat-header">
              {activeReceiver?.is_superuser ? (
                <img src={logo} alt="Admin" style={{ borderRadius: "0%" }} className="current-user-avatar" />
              ) : activeReceiver?.profile_picture ? (
                <img src={activeReceiver?.profile_picture} alt={activeReceiver?.first_name} className="current-user-avatar" />
              ) : (
                <img src={user_icone} alt={activeReceiver?.first_name} className="current-user-avatar" />
              )}
              <div className="current-user-info">
                <h5 className="current-user-name">
                  {activeReceiver?.is_superuser ? "🔐 Admin Support" : `${activeReceiver?.first_name || ""} ${activeReceiver?.last_name || ""}`}
                </h5>
                {connectionError && <span style={{ color: '#ff6b6b', fontSize: '12px' }}>⚠️ Connection error</span>}
              </div>
            </div>

            <div className="messages-container" ref={messagesContainerRef}>
              {messages && messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <div 
                    key={msg.id || `${idx}-${msg.timestamp}`}
                    className={`message-wrapper ${msg.sender == user_id ? 'user-message' : 'other-message'}`}
                  >
                    <div className={`message-bubble ${msg.sender == user_id ? 'user-bubble' : 'other-bubble'}`}>
                      {msg.image && <img src={msg.image} alt="Chat attachment" className="chat-image" />}
                      {msg.text && <p className="message-content">{msg.text}</p>}
                      <span className="message-timestamp">{extractTime(msg.timestamp)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              
              {chatLoading && (
                <div className="message-wrapper user-message">
                  <div className="message-bubble user-bubble loading-bubble">
                    <div className="loading-dots">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="message-input-container">
              {selectedImage && (
                <div className="image-preview">
                  <button onClick={() => setSelectedImage(null)} className="remove_selected">
                    <X />
                  </button>
                  <img src={selectedImage} alt="Preview" className="preview-img" />
                </div>
              )}
              <div className="message-input-wrapper">
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: "none" }} 
                  id="fileInput"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setSelectedImage(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label htmlFor="fileInput" className="Paperclip_label" title="Attach image">
                  <Paperclip className="input-icon" style={{ width: "25px", height: "25px" }} />
                </label>

                <input 
                  type="text" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                  placeholder="Write a message..." 
                  className="message-input"
                  disabled={connectionError}
                />
                <button 
                  onClick={sendMessage} 
                  className="send-button"
                  disabled={connectionError || (!message.trim() && !selectedImage)}
                  title="Send message (or press Enter)"
                >
                  <Send className="send-icon" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            fontSize: '16px',
            color: '#999'
          }}>
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
