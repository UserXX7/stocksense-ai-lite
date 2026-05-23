import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>StockSense <span>AI Lite</span></h1>
        <h2>Create Your Account</h2>
        <p>Join StockSense AI Lite today.</p>

        <input type="text" placeholder="Full Name" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <input type="password" placeholder="Confirm Password" />

        <Link to="/dashboard" className="primary-btn">
          Create Account
        </Link>

        <p className="auth-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;