import React, { useState } from "react";
import { Disc3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!username.trim()) {
          setError("Username is required.");
          setIsSubmitting(false);
          return;
        }

        const res = await register(username, email, password);
        if (!res.success) {
          setError(res.message);
        } else {
          // Attempt auto-login right after registration
          const loginRes = await login(email, password);
          if (!loginRes.success) {
            setError(loginRes.message);
          }
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.message);
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-box">
        <div className="login-brand">
          <Disc3 size={48} className="brand-icon" />
          <h1>VibeStream</h1>
          <p>
            {isRegister
              ? "Create your account to start streaming"
              : "Sign in to access your custom playlists"}
          </p>
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
                required
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
              required
            />
          </div>

          <div className="form-group">
            <label>Password (min. 6 characters)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Processing..."
              : isRegister
              ? "Create Account"
              : "Log In"}
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