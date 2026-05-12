/* eslint-disable no-unused-vars */
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useEffect, useState, useContext } from 'react';
import './SignUp.css';
import API from '../api';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingContext } from '../App';
import { setUserEmail } from '../otpSlice';



const SignUp = () => {


  const setIsLoading = useContext(LoadingContext);
  const { isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    cpassword: '',
  });

  const handleChange = (e) => { 
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const apiUrl = import.meta.env.VITE_API_URL;

  const navigateToGoogleLogin = () => {
    window.location.replace(`${apiUrl}user/auth/google/`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.cpassword) {
      toast.warning('Password and Confirm Password should be same');
    }
    setIsLoading(true);
    try {
      const response = await API.post('/user/signup/', formData);
      toast.success(response.data.message);
      localStorage.setItem('email', formData.email);
      dispatch(setUserEmail(formData.email));
      localStorage.setItem('forgot_password', false);
      navigate('/signup/enterotp');
    } catch (error) {
      if (error.response) {
        for (let key in error.response.data) {
          const value = error.response.data[key];
          if (Array.isArray(value)) {
            value.map((item) => toast.error(`${key}: ${item}`));
          } else if (typeof value === 'string') {
            toast.error(`${key}: ${value}`);
          } else {
            toast.error(JSON.stringify(value));
          }
        }
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="container sign_up_main">
      <div className="row">
        <div className="col-lg-6 col-md-12 col-12 col-sm-12 cols-grid form-div">
          <div className="sign_form">
            <h2>Welcome</h2>
            <hr />
            <form onSubmit={handleSubmit}>
              <div className="half-input">
                <div className="form-group">
                  <label htmlFor="first_name" className='label'>First name</label>
                  <input type="text" className="form-input" id="first_name" required value={formData.first_name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name" className='label'>Last name</label>
                  <input type="text" className="form-input" id="last_name" required value={formData.last_name} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="username" className='label'>Username</label>
                <input type="text" className="form-input" id="username" required value={formData.username} onChange={handleChange} />
              </div>
              <div className="half-input">
                <div className="form-group">
                  <label htmlFor="email" className='label'>Email</label>
                  <input type="email" className="form-input" id="email" required value={formData.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className='label'>Phone</label>
                  <input type="text" className="form-input" id="phone" required value={formData.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="half-input">
                <div className="form-group">
                  <label htmlFor="password" className='label'>Password</label>
                  <input type="password" className="form-input" id="password" required value={formData.password} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="cpassword" className='label'>Confirm Password</label>
                  <input type="password" className="form-input" id="cpassword" required value={formData.cpassword} onChange={handleChange}/>
                </div>
              </div>
              <hr />
              <button type="submit" className="form_submit_btn">Verify</button>
            </form>
            <div className="sign_up">
              <p className='label' onClick={() => navigate('/signin')}>{`"Already Have an account? Please LogIn"`}</p>
            </div>

            <div className='google_sign_in'>
              {/* <svg onClick={navigateToGoogleLogin} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
              </svg> */}
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-12 col-12 col-sm-12 cols-grid logo-class">
          <img src={logo} alt="" />
          <h1>Work Laza</h1>
          <span>{`"Where Works Meet Solution !"`}</span>
        </div>
      </div>
    </div>
  )
}

export default SignUp
