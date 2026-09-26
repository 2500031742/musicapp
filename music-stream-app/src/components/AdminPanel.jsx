import React, { useState, useEffect } from "react";
import { ShieldAlert, Trash2, Users, Music, UploadCloud } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useMusic } from "../context/MusicContext";

export default function AdminPanel({ onOpenAddSong }) {
  const { songs, deleteSong } = useMusic();
  const [users, setUsers] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState("songs");
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (activeAdminTab === "users") {
      fetchUsers();
    }
  }, [activeAdminTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase.from("profiles").select("*");
    if (!error && data) {
      setUsers(data);
    }
    setLoadingUsers(false);
  };

  const handleDeleteSong = async (song) => {
    if (window.confirm(`ADMIN ACTION: Are you sure you want to permanently delete "${song.title}"?`)) {
      await deleteSong(song.id);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-title">
          <ShieldAlert size={28} color="#1db954" />
          <h2>Admin Control Center</h2>
        </div>
        <div className="admin-stats">
          <div className="stat-badge">
            <Music size={16} />
            <span>{songs.length} Tracks</span>
          </div>
          <div className="stat-badge">
            <Users size={16} />
            <span>{users.length || "—"} Registered Users</span>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeAdminTab === "songs" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("songs")}
        >
          Catalog Management
        </button>
        <button
          className={`admin-tab-btn ${activeAdminTab === "users" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("users")}
        >
          User Profiles
        </button>
        <button className="btn-primary" onClick={onOpenAddSong} style={{ marginLeft: "auto" }}>
          <UploadCloud size={16} />
          <span>Add Catalog Song</span>
        </button>
      </div>

      {activeAdminTab === "songs" && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Artist</th>
                <th>Album</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song.id}>
                  <td>
                    <img src={song.cover} alt={song.title} className="table-thumb" />
                  </td>
                  <td className="font-semibold">{song.title}</td>
                  <td>{song.artist}</td>
                  <td>{song.album}</td>
                  <td>{song.duration || "N/A"}</td>
                  <td>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDeleteSong(song)}
                      title="Permanently remove track"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeAdminTab === "users" && (
        <div className="admin-table-wrapper">
          {loadingUsers ? (
            <p className="loading-text">Loading registered profiles...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="code-font">{u.id.substring(0, 8)}...</td>
                    <td className="font-semibold">{u.username || "Anonymous"}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role === "admin" ? "admin" : "user"}`}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
