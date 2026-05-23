import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleLogin(e) {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("stocksenseUser"));

    if (formData.email === "" || formData.password === "") {
      setError("Please enter your email and password.");
      return;
    }

    if (!savedUser) {
      setError("No account found. Please create an account first.");
      return;
    }

    if (
      formData.email === savedUser.email &&
      formData.password === savedUser.password
    ) {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleLogin}>
        <h1>
          StockSense <span>AI Lite</span>
        </h1>

        <h2>Welcome Back</h2>
        <p>Sign in to continue to your dashboard.</p>

        {error && <div className="error-message">{error}</div>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" className="primary-btn">
          Login
        </button>

        <p className="auth-link">
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;