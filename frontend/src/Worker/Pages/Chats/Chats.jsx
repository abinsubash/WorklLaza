import { useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import { Paperclip, Send, X, ArrowBarRight, ArrowBarLeft } from "react-bootstrap-icons";
import user_icone from '../../../assets/user.png'
import logo from '../../../assets/logo.png'
import "./Chats.css";
import API from '../../../api'
import secureRequest from "../../../Compenets/ProtectedRoute/secureRequest";

const Chat = () => {

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeReceiver, setActiveReceiver] = useState();
  const [chatRooms, setChatRooms] = useState();
  const [socket, setSocket] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const { user_id } = useSelector((state) => state.auth)
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const VITE_WEBSOCKET_CHAT_URL = import.meta.env.VITE_WEBSOCKET_CHAT_URL;
  const [sidebar, setSidebar] = useState(true);

  const fetchData = async (chatReceiverId=null) =>{

    chatReceiverId = chatReceiverId == null ? localStorage.getItem("chatReceiverId") || 3 : chatReceiverId;
    await secureRequest(async () => {
      API.post(`/chat/get_chats/`, {"user_id":user_id, "chatReceiverId":chatReceiverId})
        .then((res) => {
          setChatRooms(res?.data?.chats)
          setActiveReceiver(res?.data?.receiver)
          setMessages(res?.data?.messages)
          const chatRoomId = res?.data?.chat_id
          if (chatRoomId) {
            openChat(chatRoomId);
          } else if (res.data?.chats.length > 0) {
            openChat(res.data.chats[0].id);
          }
        })
        .catch((error) => console.error("Error fetching chats:", error));
    });
  }

  useEffect(() => {
    fetchData();
  }, []);
  

  const openChat =async (chatRoomId) => {
    localStorage.setItem("chatRoomId", chatRoomId);
    if (socket) socket.close();
    await secureRequest(async () => {
      const newWs = new WebSocket(`${VITE_WEBSOCKET_CHAT_URL}${chatRoomId}/`);
      newWs.onmessage = (event) => {
        setChatLoading(true);
        const data = JSON.parse(event.data);  
        setMessages((prev) => [...prev, { sender: data.sender, text: data.message, timestamp:data.timestamp, image: data.image || null, id: `${data.timestamp}-${data.sender}` }]);
        setTimeout(() => { 
          setChatLoading(false);
        }, 50);
      };
      setSocket(newWs);
    })
  };

  const sendMessage = async () => {
    if (socket && socket.readyState === WebSocket.OPEN && (message.trim() || selectedImage)) {
      await secureRequest(async () => {
        socket.send(JSON.stringify({ message: message || null, sender: user_id, image: selectedImage || null }));
      });
      setMessage("");
      setSelectedImage(null);
    }
  };

  function extractTime(timestampString) {
    const date = new Date(timestampString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const togleSidebar= ()=>{
    setSidebar(!sidebar)
  }

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);


  return (
    <div className="chat-container">
      <div className={`chat-sidebar ${sidebar? "chat-sidebar-open":"chat-sidebar-closed"}`} onClick={togleSidebar}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Chats</h1>
        </div>
        <div className="users-list">
        {chatRooms?.map(chatRoom => {
          const opponet = chatRoom?.user2_profile.id == user_id ? chatRoom?.user1_profile : chatRoom?.user2_profile;
          return (
            <div  key={chatRoom.id} className={`user-item ${opponet?.id === user_id ? 'active' : ''}`} onClick={() => fetchData(opponet?.id )} >
              <div className="avatar-container">
                {opponet.is_superuser ? <img src={logo} alt="Admin user" style={{borderRadius:"0%"}}  className="user-avatar"></img>:opponet?.profile_picture?<img src={`${opponet?.profile_picture}`} alt={opponet?.name} className="user-avatar" />: <img  src={user_icone}  alt={activeReceiver?.first_name}  className="current-user-avatar"  />}
                {opponet?.active && <span className="status-indicator"></span>}
              </div>
              <div className="user-details">
              {opponet.is_superuser ?<span className="user-name">Chat with admin</span> :<span className="user-name">{opponet?.first_name} {opponet?.last_name}</span>}
                {opponet?.unread > 0 && (
                   <span className="unread-badge">{opponet?.unread}</span>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
      <button className="side_bar_togle" onClick={togleSidebar}>{sidebar ? <ArrowBarLeft fontSize={25} fontWeight={900} /> : <ArrowBarRight fontSize={25} fontWeight={900} />}</button>
      <div className={`chat-main ${sidebar? 'chat-main-closed':'chat-main -open'}`}>
        <div className="chat-header" onClick={togleSidebar}>
          {activeReceiver?.is_superuser ? <img src={logo} alt="Admin user" style={{borderRadius:"0%"}} className="current-user-avatar"></img> :activeReceiver?.profile_picture? <img  src={`${activeReceiver?.profile_picture}`}  alt={activeReceiver?.first_name || "User"}  className="current-user-avatar"  />: <img  src={user_icone}  alt={activeReceiver?.first_name || "User"}  className="current-user-avatar"  />}

          <div className="current-user-info">
          {activeReceiver?.is_superuser ? <h5 className="current-user-name">Admin user</h5> :<h5 className="current-user-name">{activeReceiver?.first_name || "Unknown"} {activeReceiver?.last_name || ""}</h5>}
          </div>
        </div>
        
        <div className="messages-container" ref={messagesContainerRef}>
          {messages?.map((msg, idx) => (
            <div  key={msg.id || `${idx}-${msg.timestamp}`}  className={`message-wrapper ${msg.sender == user_id ? 'user-message' : 'other-message'}`} >
              <div className={`message-bubble ${msg.sender == user_id ?'user-bubble' : 'other-bubble'}`}>
                {msg.image && <img src={`${msg.image}`} alt="Sent Image" className="chat-image" />}
                {msg.text && <p className="message-content">{msg.text}</p>}
                <span className="message-timestamp">{extractTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="message-wrapper user-message" >
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
              <button onClick={() => setSelectedImage(null)} className="remove_selected"><X/></button>
              <img src={selectedImage} alt="Preview" className="preview-img" />
            </div>
          )}
          <div className="message-input-wrapper">
          <input type="file" accept="image/*" style={{ display: "none" }} id="fileInput" onChange={(e) => {
              const file = e.target.files[0];
              if (file) { const reader = new FileReader(); reader.onloadend = () => { setSelectedImage(reader.result) }; reader.readAsDataURL(file); }
            }} />

            <label htmlFor="fileInput" className="Paperclip_label"> <Paperclip className="input-icon" style={{width:"25px",height:"25px"}}/> </label>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Write a message..." className="message-input" />
            <button  onClick={sendMessage} className="send-button" > <Send className="send-icon" /> </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Chat;
