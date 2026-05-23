import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleRegister(e) {
    e.preventDefault();

    if (
      formData.fullName === "" ||
      formData.email === "" ||
      formData.password === "" ||
      formData.confirmPassword === ""
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const user = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    };

    localStorage.setItem("stocksenseUser", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");

    navigate("/dashboard");
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleRegister}>
        <h1>
          StockSense <span>AI Lite</span>
        </h1>

        <h2>Create Your Account</h2>
        <p>Join StockSense AI Lite and start tracking your favorite stocks.</p>

        {error && <div className="error-message">{error}</div>}

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
        />

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

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" className="primary-btn">
          Create Account
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;