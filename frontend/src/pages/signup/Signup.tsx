import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { SyntheticEvent } from '../../interfaces/Todo.interface';
import { IRegisterForm } from './Signup.interface';
import './Signup.css';
import { toast } from 'react-toastify';

export const Signup = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Track loading state
  const [form, setForm] = useState<IRegisterForm>({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e: SyntheticEvent) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleRegister = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      toast.warning("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        navigate("/login", {
          state: {
            fromRegister: true,
            message: data.message || "Registration successful. Please check your email.",
          },
        });
      } else {
        throw new Error(data.message || "Registration failed");
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error in registration!");
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-auth-box">
        <div className="signup-section">
          <div className="heading" style={{ display: 'flex', justifyContent: 'center', fontSize: "35px" }}>
            <p>Register</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <input
                type="text"
                name='username'
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                disabled={loading} // Disable input when loading
              />
              <span><FontAwesomeIcon icon={faUser} /></span>
            </div>

            <div className="input-group">
              <input
                type="email"
                name='email'
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />
              <span><FontAwesomeIcon icon={faEnvelope} /></span>
            </div>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name='password'
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
              <span><FontAwesomeIcon icon={faLock} /></span>
            </div>

            <span className='password-checkbox'>
              <input
                type='checkbox'
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                disabled={loading}
              />
              <label>Show password</label>
            </span>

            <div className="register-btn">
              <button type="submit" disabled={loading}>Register</button>
            </div>
          </form>

          <p className="social-text">or register with social platforms</p>

          <div className="social-icons">
          <button className="google-btn">
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
                Sign in with Google
              </button>
          </div>
        </div>

        <div className="login-info">
          <p style={{ fontSize: "40px" }}>Welcome Back!</p>
          <p style={{ fontSize: "15px" }}>Already have an account?</p>
          <button onClick={() => navigate("/login")} disabled={loading}>Login</button>
        </div>
      </div>
    </div>
  );
};
