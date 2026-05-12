/* eslint-disable no-unused-vars */
import './Header.css'
import logo from '../../assets/logo.png'
import { Person, Bell, Pass, ChatLeftDots, PersonFill } from 'react-bootstrap-icons';
import { useState, useContext, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PageContext } from '../../Layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../authSlice';


const Header = ({ page, not_found = "false" }) => {

  const { username, first_name, last_name, role, isAuthenticated, user_id } = useSelector((state) => state.auth)

  const setPage = useContext(PageContext);
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [ws, setWs] = useState(null);
  const web_socket_url = import.meta.env.VITE_WEBSOCKET_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [isDropDwon, setIsDropDwon] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setPage('Home')
    localStorage.setItem('page', 'Home')
    dispatch(logout());
    toast.success('user Loged out');
  };

  useEffect(() => {
    if (!user_id || !isAuthenticated || !web_socket_url) return;

    const socket = new WebSocket(`${web_socket_url}${user_id}/`);

    socket.onopen = () => {
      console.log("WebSocket Connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const ispage = localStorage.getItem("page")
      if (ispage !== "Chat" || data.title !== "New message"){
        setNotifications((prev) => [data, ...prev]);
        toast(`${data.title}: ${data.body}`);
      }
    }

    socket.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    setWs(socket);
    return () => socket.close();
  }, [user_id, isAuthenticated, web_socket_url])

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const navigate = useNavigate();




  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light" >
        <a className="navbar-brand" href="#">
          <img src={logo} alt="" />
          <h4>Work Laza</h4>
        </a>

        <div className="collapse navbar-collapse" id="navbarSupportedContent" >
          <ul className="navbar-nav ">
            <li className="nav-item active">
              <a className={`nav-link ${page == 'Home' ? 'selected' : null}`} onClick={() => { setPage('Home'), localStorage.setItem('page', 'Home') }}>Home<span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item active">
              <a className={`nav-link ${page == 'Workers' ? 'selected' : null}`} onClick={() => { setPage('Workers'), localStorage.setItem('page', 'Workers') }}>Workers<span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item active">
              <a className={`nav-link ${page == 'Bookings' ? 'selected' : null}`} onClick={() => { setPage('Bookings'), localStorage.setItem('page', 'Bookings') }}>Bookings<span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item active">
              <a className={`nav-link ${page == 'Saved' ? 'selected' : null}`} onClick={() => { setPage('Saved'), localStorage.setItem('page', 'Saved') }}>Saved<span className="sr-only">(current)</span></a>
            </li>
          </ul>
        </div>
        <div className={`${!isAuthenticated && "header-icones-small"} header-icones`}>
          {isAuthenticated && <ChatLeftDots color="#AFDDE5" style={{ color: 'white', cursor: 'pointer', fontSize: '25px' }} onClick={() => { setPage('Chat'), localStorage.setItem('page', 'Chat') }}/>}
          <button className='user-icone-heder' type="button" onClick={()=>setIsDropDwon(!isDropDwon)}>
            <PersonFill color="#AFDDE5" size={25} style={{ color: 'white', cursor: 'pointer', fontSize: '25px'}}/>
          </button>
          {isAuthenticated && 
            <div className="notification-icon" >
              <Bell style={{ color: '#AFDDE5', cursor: 'pointer', fontSize: '25px' }} onClick={toggleDropdown}/>
              {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
            </div>
          }
        </div>
        {
          isDropDwon && <div className={`custom-dropdown ${isAuthenticated? "blue": "not-isauth" }`}>
          <div className="custom-dropdown-menu" >

            {!isAuthenticated ? <a className="custom-dropdown-item" onClick={() => {setIsDropDwon(!isDropDwon),navigate('/signin')}}>Sign In</a> : null}
            {!isAuthenticated ? <a className="custom-dropdown-item" onClick={() => {setIsDropDwon(!isDropDwon),navigate('/signup')}}>Sign Up</a> : null}
            {isAuthenticated ? <a className="custom-dropdown-item" onClick={() => {setIsDropDwon(!isDropDwon), setPage('Profile'), localStorage.setItem('page', 'Profile') }}>View profile</a> : null}
            {role == "user" ? <a className="custom-dropdown-item" onClick={() =>{setIsDropDwon(!isDropDwon), navigate('/worker_register')}}>Register as a worker</a> : null}
            {isAuthenticated ? <a style={{ color: "red" }} className="custom-dropdown-item dropdown-item-red" onClick={()=>{setIsDropDwon(!isDropDwon), handleLogout()}}>Log out</a> : null}

          </div>
        </div>
        }
        
        <div className="notification-dropdown" ref={dropdownRef}>
          {isOpen && (

            <div className="dropdown-content">
              <div className="header">
                <span>Notifications</span>
              </div>
              <ul>
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <li key={index} className="notification-item">
                      <div className="text">
                        <p>{notif.body}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="no-notifications">No new notifications</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <svg width="34" height="35" viewBox="0 0 34 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.25 10.0625C4.25 9.4757 4.7257 9 5.3125 9H28.6875C29.2743 9 29.75 9.4757 29.75 10.0625C29.75 10.6493 29.2743 11.125 28.6875 11.125H5.3125C4.7257 11.125 4.25 10.6493 4.25 10.0625ZM4.25 17.5C4.25 16.9132 4.7257 16.4375 5.3125 16.4375H28.6875C29.2743 16.4375 29.75 16.9132 29.75 17.5C29.75 18.0868 29.2743 18.5625 28.6875 18.5625H5.3125C4.7257 18.5625 4.25 18.0868 4.25 17.5ZM15.9375 24.9375C15.9375 24.3507 16.4132 23.875 17 23.875H28.6875C29.2743 23.875 29.75 24.3507 29.75 24.9375C29.75 25.5243 29.2743 26 28.6875 26H17C16.4132 26 15.9375 25.5243 15.9375 24.9375Z" fill="white" />
          </svg>
        </button>
      </nav>
    </div>
  )
}

export default Header
