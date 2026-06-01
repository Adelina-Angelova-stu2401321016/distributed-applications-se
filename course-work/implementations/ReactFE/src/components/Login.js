import "../styles/login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/authContext";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(username, password);

      loginContext(data); 
      navigate("/home");
    } catch {
      setError("Login failed");
    }
  };



return (
  <div className="login-page">
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Museum Login</h2>

      <input
        className="login-input"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <input
        className="login-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="login-error">{error}</p>}

      <button className="login-button" type="submit">
        Login
      </button>
    </form>
  </div>
);

}

export default Login;