/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from 'react';
import './Layout.css';
import Header from '../Compenets/header/Header';
import Footer from '../Compenets/Footer/Footer'
import Home from '../Pages/Home/Home'
import Saved from '../Pages/Saved/Saved'
import Workers from '../Pages/Workers/Workers';
import Worker_details from '../Pages/Worker_details/Worker_details';
import Booking_details from '../Pages/Booking_details/Booking_details';
import Bookings from '../Pages/Bookings/Bookings'
import Not_found from '../Pages/Not_found/Not_found';
import { useNavigate } from 'react-router-dom';
import Chat from '../Compenets/Chat/Chat'
import Profile from '../Pages/Profile/Profile';
import ProtectedRoute from '../Compenets/ProtectedRoute/ProtectedRoute'
import { useDispatch, useSelector } from 'react-redux';
import { getGeolocation } from '../Compenets/Address/GetAddress';
import API from '../api';
import { toast } from 'sonner';
import { logout } from '../authSlice';

export const PageContext = createContext();

const Layout = ({ not_found = "false" } = {}) => {

  const navigate = useNavigate();
  const { role,refreshToken } = useSelector((state) => state.auth)
  const dispatch = useDispatch();
  const [page, setPage] = useState(localStorage.getItem('page')||'Home');

  const user_status_handler= async() =>{
    try {
      await API.post('/token/refresh/', { refresh: refreshToken})
    } catch (err) {
      if(err.response.status==401){
        toast.warning('This account is blocked by the admin!!')
        setPage('Home')
        localStorage.setItem('page','Home')
        await dispatch(logout())
        navigate('/')
      }
    }
  }

  useEffect(() => {
    if (not_found == "true") {
      setPage('not')
    }
    user_status_handler()
    getGeolocation() 
  }, [])

  useEffect(() => {
    switch (role) {
      case 'admin':
        navigate('/admin-panel');
        break;
      case 'worker':
        navigate('/worker');
        break;
      default:
        navigate('/');
    }
  }, [role, navigate]);


  return (
    <>
      <PageContext.Provider value={setPage}>
        <Header page={page} not_found={not_found} />
        {page == 'Home' && <Home />}
        {page == 'Saved' && <ProtectedRoute><Saved /></ProtectedRoute>}
        {page == 'Workers' && <Workers />}
        {page.slice(0,14) == 'Worker_details' &&<Worker_details worker_id={page.slice(15)}/>}
        {page.slice(0,15) == 'Booking_details' &&<ProtectedRoute><Booking_details booking_id={page.slice(16)}/></ProtectedRoute>}
        {page == 'Chat' &&<ProtectedRoute><Chat/></ProtectedRoute>}
        {page == 'Bookings' && <ProtectedRoute><Bookings /></ProtectedRoute>}
        {page == 'Profile' && <ProtectedRoute><Profile /></ProtectedRoute>}
        {page == 'not' && <Not_found />}

        {/* Redirect to Home if page is invalid */}
        {!['Home', 'Saved', 'Workers', 'Chat', 'Bookings', 'Profile'].includes(page) &&
          !page.startsWith('Worker_details') && !page.startsWith('Booking_details') && (() => {
            setPage('Home');
            localStorage.setItem('page', 'Home');
            return <Home />;
          })()
        }

        <Footer />
      </PageContext.Provider>
    </>
  )


}

export default Layout
