import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import { SyntheticEvent } from "../../interfaces/Todo.interface";
import './Login.css'

export const Login = () => {

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: SyntheticEvent) => {
    e.preventDefault();

    fetch(`${apiUrl}/login` as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Login failed!");
        }
        return response.json();
      })
      .then((data) => {
        if (data.message === "Login successful") {
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("user_id", data.user.id)
          toast.success("Login successful!");
          navigate("/")
        } else {
          toast.error(data.message || "Login Failed!");
        }
      })
      .catch(() => {
        toast.error("User doesn't exist.");
      });
  };

  return (
    <div className="login-container">
      <div className="login_container">
        <div className="login-auth-box">
          <div className="signup-info">
            <p style={{ fontSize: "40px" }}>Hello, Welcome!</p>
            <p style={{ fontSize: "15px" }}>Don't have an account?</p>
            <button onClick={() => navigate("/register")} className="login-btn">Register</button>
          </div>

          <div className="login-section">
            <div className="heading">
              <p>Login</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} />
                <span><FontAwesomeIcon icon={faEnvelope} /></span>
              </div>

              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} />
                <span><FontAwesomeIcon icon={faLock} /></span>
              </div>
              <span className='password-checkbox'>
                <input type='checkbox' checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)} />
                <label style={{ paddingLeft: "2px" }}>Show password</label>
              </span>

              <div className="login-btn">
                <button type="submit">Login</button>
              </div>
              <p className="social-text">or register with social platforms</p>
            </form>
            <div className="social-icons">
              <button className="google-btn">
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
