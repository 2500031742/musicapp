import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("music_active_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const register = (username, email, password) => {
    const existingUsers = JSON.parse(localStorage.getItem("music_users") || "[]");
    const userExists = existingUsers.some((u) => u.email === email);

    if (userExists) {
      return { success: false, message: "Email already registered." };
    }

    const newUser = { id: "user-" + Date.now(), username, email, password };
    existingUsers.push(newUser);
    localStorage.setItem("music_users", JSON.stringify(existingUsers));
    
    // Write session and immediately set state
    localStorage.setItem("music_active_user", JSON.stringify(newUser));
    setCurrentUser(newUser);
    return { success: true };
  };

  const login = (email, password) => {
    const existingUsers = JSON.parse(localStorage.getItem("music_users") || "[]");
    const user = existingUsers.find((u) => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: "Invalid email or password." };
    }

    // Write session and immediately set state
    localStorage.setItem("music_active_user", JSON.stringify(user));
    setCurrentUser(user);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("music_active_user");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);