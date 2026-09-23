import React, { useState } from "react";
import { Disc3, Heart, ListMusic, Plus, Radio } from "lucide-react";
import { useMusic } from "../context/MusicContext";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ activeTab, setActiveTab }) {
  const { playlists, createPlaylist } = useMusic();
  const { currentUser } = useAuth();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName);
    setNewPlaylistName("");
    setShowInput(false);
  };

  return (
    <aside className="sidebar">
      <div className="logo-section">
        <Disc3 size={32} className="brand-icon" />
        <h2>VibeStream</h2>
      </div>

      <nav className="nav-menu">
        <button
          className={`nav-item ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <Radio size={20} />
          <span>All Songs</span>
        </button>
        <button
          className={`nav-item ${activeTab === "liked" ? "active" : ""}`}
          onClick={() => setActiveTab("liked")}
        >
          <Heart size={20} />
          <span>Liked Songs</span>
        </button>
      </nav>

      <div className="playlist-section">
        <div className="playlist-header">
          <span>YOUR PLAYLISTS</span>
          {currentUser && (
            <button className="icon-add-btn" onClick={() => setShowInput(!showInput)}>
              <Plus size={16} />
            </button>
          )}
        </div>

        {showInput && (
          <form onSubmit={handleCreate} className="playlist-form">
            <input
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-small">Create</button>
          </form>
        )}

        <div className="playlist-list">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              className={`nav-item ${activeTab === pl.id ? "active" : ""}`}
              onClick={() => setActiveTab(pl.id)}
            >
              <ListMusic size={18} />
              <span>{pl.name}</span>
            </button>
          ))}
          {playlists.length === 0 && (
            <p className="empty-hint">No playlists yet. Click + to add.</p>
          )}
        </div>
      </div>
    </aside>
  );
}