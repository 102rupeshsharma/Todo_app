import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import { faGoogle, faFacebook, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { SyntheticEvent } from '../../interfaces/Todo.interface';
import { IRegisterForm } from './Signup.interface';
import './Signup.css';
import { toast } from 'react-toastify';

export const Signup = () => {

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<IRegisterForm>({
    username: '',
    email: '',
    password: ''
  })

  const handleChange = (e: SyntheticEvent) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleRegister = async (e: SyntheticEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
  
      if (data.message === "User registered successfully") {
        toast.success("Registration Successful!");
        navigate('/login');
      } else {
        toast.error(data.message || "Failed to register!");
      }
  
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error in registration!");
    }
  };
  
  return (
    <div className="signup-container">
      <div className="signup-auth-box">
        <div className="signup-register-section">
          <p style={{ fontSize: "25px", marginTop: "10px", marginLeft: "100px" }}>Register</p>
          <form onSubmit={handleRegister}>

            <div className="input-group">
              <input type="text" name='username' placeholder="Username" value={form.username} onChange={handleChange} />
              <span><FontAwesomeIcon icon={faUser} /></span>
            </div>

            <div className="input-group">
              <input type="email" name='email' placeholder="Email" value={form.email} onChange={handleChange} />
              <span><FontAwesomeIcon icon={faEnvelope} /></span>
            </div>

            <div className="input-group">
              <input type={showPassword ? "text" : "password"} name='password' placeholder="Password" value={form.password} onChange={handleChange} />
              <span><FontAwesomeIcon icon={faLock} /></span>
            </div>
            <span className='password-checkbox'>
              <input type='checkbox' checked={showPassword}
                onChange={() => setShowPassword(!showPassword)} />
              <label style={{ paddingLeft: "2px" }}>Show password</label>
            </span>

            <button className="register-btn" type="submit" >Register</button>
            <p className="social-text">or register with social platforms</p>
            </form>

            <div className="social-icons">
              <button><FontAwesomeIcon icon={faGoogle} /></button>
              <button><FontAwesomeIcon icon={faFacebook} /></button>
              <button><FontAwesomeIcon icon={faGithub} /></button>
              <button><FontAwesomeIcon icon={faLinkedin} /></button>
            </div>
        </div>

        <div className="signup-login-section">
          <p style={{ fontSize: "30px", margin: "10px 0px" }}>Hello, Welcome!</p>
          <p style={{ fontSize: "15px", margin: "10px 0px" }}>Already have an account?</p>
          <button onClick={() => navigate("/login")} className="login-btn">Login</button>
        </div>

      </div>
    </div>

  )
};