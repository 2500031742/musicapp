import React from "react";
import { Search, LogOut, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ searchTerm, setSearchTerm, onOpenAddSong }) {
  const { currentUser, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search by song, artist, or album..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="nav-actions">
        <button className="btn-secondary" onClick={onOpenAddSong}>
          <PlusCircle size={18} />
          <span>Add Song</span>
        </button>

        <div className="user-profile">
          <span className="username">👋 {currentUser?.username}</span>
          <button className="btn-icon" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}