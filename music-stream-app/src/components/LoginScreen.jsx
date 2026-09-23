import React, { useState } from "react";
import { Disc3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isRegister) {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setError("All fields are required.");
        return;
      }
      const res = register(username, email, password);
      if (!res.success) setError(res.message);
    } else {
      if (!email.trim() || !password.trim()) {
        setError("Please enter your email and password.");
        return;
      }
      const res = login(email, password);
      if (!res.success) setError(res.message);
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-box">
        <div className="login-brand">
          <Disc3 size={48} className="brand-icon" />
          <h1>VibeStream</h1>
          <p>Sign in to start listening and managing your library</p>
        </div>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-submit">
            {isRegister ? "Create Account" : "Log In"}
          </button>
        </form>

        <div className="toggle-mode">
          {isRegister ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <span
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister ? "Sign In" : "Register here"}
          </span>
        </div>
      </div>
    </div>
  );
}