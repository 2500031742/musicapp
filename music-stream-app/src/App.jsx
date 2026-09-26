import React, { useState, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import SongCard from "./components/SongCard";
import Player from "./components/Player";
import AddSongModal from "./components/AddSongModal";
import LoginScreen from "./components/LoginScreen";
import AdminPanel from "./components/AdminPanel";
import { useAuth } from "./context/AuthContext";
import { MusicProvider, useMusic } from "./context/MusicContext";

function DashboardView() {
  const { songs, likedSongIds, playlists } = useMusic();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [addSongOpen, setAddSongOpen] = useState(false);

  const displayedSongs = useMemo(() => {
    let filtered = songs;

    if (activeTab === "liked") {
      filtered = songs.filter((song) => likedSongIds.includes(song.id));
    } else if (activeTab !== "all" && activeTab !== "admin") {
      const activePlaylist = playlists.find((p) => p.id === activeTab);
      filtered = activePlaylist ? songs.filter((song) => activePlaylist.songIds.includes(song.id)) : [];
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [songs, activeTab, likedSongIds, playlists, searchTerm]);

  const getHeaderTitle = () => {
    if (activeTab === "all") return "Browse All Tracks";
    if (activeTab === "liked") return "Liked Songs";
    if (activeTab === "admin") return "Admin Management";
    const pl = playlists.find((p) => p.id === activeTab);
    return pl ? pl.name : "Playlist";
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-content">
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenAddSong={() => setAddSongOpen(true)}
        />

        {activeTab === "admin" ? (
          <AdminPanel onOpenAddSong={() => setAddSongOpen(true)} />
        ) : (
          <main className="dashboard">
            <div className="dashboard-header">
              <div>
                <h2>{getHeaderTitle()}</h2>
                <span className="track-count">{displayedSongs.length} songs available</span>
              </div>
            </div>

            {displayedSongs.length === 0 ? (
              <div className="empty-state">
                <p>No songs found in this section.</p>
              </div>
            ) : (
              <div className="songs-grid">
                {displayedSongs.map((song) => {
                  const originalIndex = songs.findIndex((s) => s.id === song.id);
                  return (
                    <SongCard
                      key={song.id}
                      song={song}
                      index={originalIndex}
                      currentPlaylistId={activeTab}
                    />
                  );
                })}
              </div>
            )}
          </main>
        )}
      </div>

      <Player />

      {addSongOpen && <AddSongModal onClose={() => setAddSongOpen(false)} />}
    </div>
  );
}

export default function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1115",
        color: "#fff",
        fontSize: "18px"
      }}>
        Loading VibeStream...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <MusicProvider key={currentUser.id}>
      <DashboardView />
    </MusicProvider>
  );
}