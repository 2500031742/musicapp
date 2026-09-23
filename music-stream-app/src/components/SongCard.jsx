import React from "react";
import { Play, Pause, Heart, Trash2, XCircle } from "lucide-react";
import { useMusic } from "../context/MusicContext";

export default function SongCard({ song, index, currentPlaylistId }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlayPause,
    toggleLike,
    likedSongIds,
    playlists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deleteSong
  } = useMusic();

  const isCurrent = currentSong?.id === song.id;
  const isLiked = likedSongIds.includes(song.id);
  const isCustomSong = song.id.startsWith("song-") && Number(song.id.replace("song-", "")) > 10;

  return (
    <div className={`song-card ${isCurrent ? "playing-card" : ""}`}>
      <div className="card-image-wrap">
        <img src={song.cover} alt={song.title} loading="lazy" />
        <button
          className="play-overlay-btn"
          onClick={() => {
            if (isCurrent) {
              togglePlayPause();
            } else {
              playSong(index);
            }
          }}
        >
          {isCurrent && isPlaying ? <Pause size={24} fill="#fff" /> : <Play size={24} fill="#fff" />}
        </button>
      </div>

      <div className="card-info">
        <h4 title={song.title}>{song.title}</h4>
        <p>{song.artist}</p>
        <span className="card-album">{song.album}</span>
      </div>

      <div className="card-actions">
        <button
          className={`like-btn ${isLiked ? "active" : ""}`}
          onClick={() => toggleLike(song.id)}
          title={isLiked ? "Unlike" : "Like"}
        >
          <Heart size={18} fill={isLiked ? "#ff4081" : "transparent"} color={isLiked ? "#ff4081" : "#bbb"} />
        </button>

        {/* Action: If currently inside a custom playlist, allow removing from that playlist */}
        {currentPlaylistId && currentPlaylistId !== "all" && currentPlaylistId !== "liked" ? (
          <button
            className="action-icon-btn remove-btn"
            onClick={() => removeSongFromPlaylist(currentPlaylistId, song.id)}
            title="Remove from this playlist"
          >
            <XCircle size={18} />
          </button>
        ) : (
          /* Add to playlist dropdown */
          playlists.length > 0 && (
            <select
              className="playlist-dropdown"
              onChange={(e) => {
                if (e.target.value) {
                  addSongToPlaylist(e.target.value, song.id);
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>+ Playlist</option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )
        )}

        {/* Action: Permanently delete custom user-added song */}
        {isCustomSong && (
          <button
            className="action-icon-btn delete-btn"
            onClick={() => {
              if (window.confirm(`Delete "${song.title}" from library?`)) {
                deleteSong(song.id);
              }
            }}
            title="Delete Song Permanently"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}