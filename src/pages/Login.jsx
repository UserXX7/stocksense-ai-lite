import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>StockSense <span>AI Lite</span></h1>
        <h2>Welcome Back!</h2>
        <p>Sign in to continue to your dashboard.</p>

        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />

        <Link to="/dashboard" className="primary-btn">
          Login
        </Link>

        <p className="auth-link">
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;