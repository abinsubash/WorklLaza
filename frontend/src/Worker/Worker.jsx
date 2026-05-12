/* eslint-disable no-unused-vars */
import { toast } from 'sonner';
import './Worker.css';
import API from '../api';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Home from './Pages/Home/Home';
import Chats from './Pages/Chats/Chats';
import Bookings from './Pages/Bookings/Bookings';
import Schedule from './Pages/Schedule/Schedule';
import Profile from './Pages/Profile/Profile';
import Payments from './Pages/Payments/Payments';
import { createContext,useContext } from 'react';
import { logout } from '../authSlice';
import ProtectedRoute from '../Compenets/ProtectedRoute/ProtectedRoute';
import secureRequest from '../Compenets/ProtectedRoute/secureRequest';

export const PageContext = createContext();


const Worker = () => {

  const [waiting, setWaiting] = useState(null);
  const { isAuthenticated, role } = useSelector((state) => state.auth)
  const navigate = useNavigate();
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [page, setPage] = useState(() => {
    // Check if returning from Stripe payment - show Payments page temporarily for verification
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      console.log('🔄 Payment redirect detected! Auto-verifying payment...');
      // Will redirect to home after verification completes
      return 'Payments';
    }
    return localStorage.getItem('page') || 'Home';
  });
  const dispatch = useDispatch();

  const worker_view = async (latitude = null, longitude = null) => {
    
    try {
      await secureRequest(async () => {
        const res = await API.post('/worker/worker_view/', { latitude, longitude })
        localStorage.setItem('full_name', res.data.full_name)
      });
    } catch (err) {
      if (err?.response?.data?.message){
        toast.error(err?.response?.data?.message)
      }
      setPage('Home')
      localStorage.setItem('page','Home')
      dispatch(logout())
    }
  }


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    }
    switch (role) {
      case 'admin':
        navigate('/admin-panel');
        break;
      case 'worker':
        navigate('/worker');
        break;
      case 'user':
        navigate('/');
        break;
      default:
        navigate('/signin');
    }
  }, [role, navigate]);

  useEffect(() => {
    try {
      if (role == "worker") {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (position) => {
            worker_view(position.coords.latitude, position.coords.longitude)
          },
          (err) => {
            toast.error("Location permission denied.");
          }
        );
      } else {
        toast.error("Geolocation is not supported by this browser.");
      }
    }
    } catch (error) {
      console.log(error)
    }
    
  }, [])

  const worker_dash =
    <div>
      <PageContext.Provider value={setPage}>
        <Navbar page={page} />
        <div className={`content-${page} content `} >
          {page == 'Home' && <ProtectedRoute><Home/></ProtectedRoute>}
          {page == 'Schedule' && <ProtectedRoute><Schedule/></ProtectedRoute>}
          {page == 'Chats' && <ProtectedRoute><Chats/></ProtectedRoute>}
          {page == 'Bookings' && <ProtectedRoute><Bookings/></ProtectedRoute>}
          {page == 'Profile' && <ProtectedRoute><Profile/></ProtectedRoute>}
          {page == 'Payments' && <ProtectedRoute><Payments setPage={setPage}/></ProtectedRoute>}

          {/* Redirect to Home if page is invalid */}
          {!['Home', 'Schedule', 'Chats', 'Bookings', 'Profile', 'Payments'].includes(page) && (() => {
              setPage('Home');
              localStorage.setItem('page', 'Home');
              return <Home />;
            })()
          }
        </div>
      </PageContext.Provider>
    </div>

  return (
    waiting ? waiting : worker_dash

  )
}

export default Worker
