/* eslint-disable react/prop-types */
import {Navigate, useNavigate} from "react-router-dom"
import {jwtDecode} from "jwt-decode"
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Loader/Loader"
import { toast } from 'sonner';
import { useState, useEffect } from "react"
import { login, logout } from "../../authSlice";
import axios from "axios";

function ProtectedRoute({children}){
    
    const [isAuthorized, setIsAuthorized] = useState(null)
    const { accessToken, refreshToken } = useSelector((state) => state.auth)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    useEffect(() => {
        auth()
    },[])
    
    const refreshTokenHandler  = async () =>{
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/token/refresh/`, { refresh: refreshToken });
            if (res.status === 200){
                const data_res = await axios.post(`${import.meta.env.VITE_API_URL}/user/featch_user_data/`,{'token':res.data.access})
                dispatch(login({ accessToken: res.data.access, refreshToken: refreshToken, username: data_res.data.username, user_id: data_res.data.id, first_name: data_res.data.first_name, last_name: data_res.data.last_name, role: data_res.data.role }));
                setIsAuthorized(true)
            } else {
                console.log('1')
                dispatch(logout());
                setIsAuthorized(false)
            }
        } catch (error) {
            console.error("Token refresh error:", error);
            localStorage.setItem('page','Home')
            dispatch(logout());
            setIsAuthorized(false)
        }
    }
    
    const auth = async () =>{
        if (!accessToken || !refreshToken){
            localStorage.setItem('page','Home')
            toast.warning('Please signIn to visit this page')
            setIsAuthorized(false)
            return
        }

        try {
            const decoded = jwtDecode(accessToken)
            const tokenExpiration = decoded.exp
            const now = Date.now()/1000
            
            if (tokenExpiration < now){
                await refreshTokenHandler();
            } else {
                setIsAuthorized(true)
            }

        } catch (error) {
            console.error("Token decoding error:", error);
            dispatch(logout());
            setIsAuthorized(false);
            navigate('/signin')
            return
        }
        

    }

    if (isAuthorized == null){
        return <Loader />
    }

    return isAuthorized ? children : <Navigate to="/signin"/>
}


export default ProtectedRoute