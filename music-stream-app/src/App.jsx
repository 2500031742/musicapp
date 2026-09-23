import React, { useState, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import SongCard from "./components/SongCard";
import Player from "./components/Player";
import AddSongModal from "./components/AddSongModal";
import LoginScreen from "./components/LoginScreen";
import { useAuth } from "./context/AuthContext";
import { useMusic } from "./context/MusicContext";

export default function App() {
  const { currentUser } = useAuth();
  const { songs, likedSongIds, playlists } = useMusic();

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [addSongOpen, setAddSongOpen] = useState(false);

  if (!currentUser) {
    return <LoginScreen />;
  }

  const displayedSongs = useMemo(() => {
    let filtered = songs;

    if (activeTab === "liked") {
      filtered = songs.filter((song) => likedSongIds.includes(song.id));
    } else if (activeTab !== "all") {
      const activePlaylist = playlists.find((p) => p.id === activeTab);
      if (activePlaylist) {
        filtered = songs.filter((song) => activePlaylist.songIds.includes(song.id));
      } else {
        filtered = [];
      }
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
    const pl = playlists.find((p) => p.id === activeTab);
    return pl ? pl.name : "Playlist";
  };

  return (
    <div className="app-container" key={currentUser.id}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-content">
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenAddSong={() => setAddSongOpen(true)}
        />

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
      </div>

      <Player />

      {addSongOpen && <AddSongModal onClose={() => setAddSongOpen(false)} />}
    </div>
  );
}