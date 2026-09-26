import React from "react";
import { Search, LogOut, PlusCircle, ShieldCheck } from "lucide-react";
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
        {currentUser?.isAdmin && (
          <button className="btn-secondary" onClick={onOpenAddSong}>
            <PlusCircle size={18} />
            <span>Upload Track</span>
          </button>
        )}

        <div className="user-profile">
          <div className="user-role-badge">
            <span className="username">👋 {currentUser?.username}</span>
            {currentUser?.isAdmin && (
              <span className="badge-admin">
                <ShieldCheck size={12} /> Admin
              </span>
            )}
          </div>
          <button className="btn-icon" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}