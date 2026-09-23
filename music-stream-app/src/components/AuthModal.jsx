import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ onClose }) {
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
      else onClose();
    } else {
      if (!email.trim() || !password.trim()) {
        setError("Please provide email and password.");
        return;
      }
      const res = login(email, password);
      if (!res.success) setError(res.message);
      else onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h3>{isRegister ? "Create an Account" : "Welcome Back"}</h3>
        <p className="modal-sub">
          {isRegister ? "Join to create your custom playlists" : "Login to access your music"}
        </p>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                placeholder="e.g. johndoe"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-submit">
            {isRegister ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="toggle-mode">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => { setIsRegister(!isRegister); setError(""); }}>
            {isRegister ? "Login here" : "Sign up here"}
          </span>
        </div>
      </div>
    </div>
  );
}