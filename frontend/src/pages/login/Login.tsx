import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClipLoader from "react-spinners/ClipLoader";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import { faGoogle, faFacebook, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { SyntheticEvent } from "../../interfaces/Todo.interface";
import './Login.css'

export const Login = () => {

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setUserData({ ...userData, [e.target.name]: e.target.value });
  // };


  const handleLogin = (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    fetch(`${apiUrl}/login` as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        setLoading(false);
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
        setLoading(false);
        toast.error("User doesn't exist.");
      });
  };

return (

  <div className="container">

    <div className={loading ? "login_container no_background" : "login_container"}>
      {loading ? (
        <div className="loader">
          <ClipLoader color={"#123abc"} loading={loading} size={50} />
        </div>
      ) : (
        <>
          <div className="auth-box">

            <div className="login-section">
              <p style={{ fontSize: "30px", margin: "10px 0px" }}>Welcome Back!</p>
              <p style={{ fontSize: "15px", margin: "10px 0px" }}>Don't have an account?</p>
              <button onClick={() => navigate("/register")} className="login-btn">Register</button>
            </div>

            <div className="register-section">
              <p style={{ fontSize: "25px", marginTop: "10px", marginLeft: "100px" }}>Login</p>
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
                    onChange={(e) => setPassword(e.target.value)}/>
                  <span><FontAwesomeIcon icon={faLock} /></span>
                </div>
                <span className='password-checkbox'>

                  <input type='checkbox' checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)} />
                  <label style={{ paddingLeft: "2px" }}>Show password</label>

                </span>

                <button className="register-btn" type="submit">login</button>
                <p className="social-text">or register with social platforms</p>
              </form>
              <div className="social-icons">
                <button><FontAwesomeIcon icon={faGoogle} /></button>
                <button><FontAwesomeIcon icon={faFacebook} /></button>
                <button><FontAwesomeIcon icon={faGithub} /></button>
                <button><FontAwesomeIcon icon={faLinkedin} /></button>
              </div>
            </div>
            </div>
            </>
            )}
          </div>
        </div>
    );
};
