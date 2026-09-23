import React from "react";
import { Play, Pause, Heart, Plus } from "lucide-react";
import { useMusic } from "../context/MusicContext";

export default function SongCard({ song, index }) {
  const { currentSong, isPlaying, playSong, togglePlayPause, toggleLike, likedSongIds, playlists, addSongToPlaylist } = useMusic();

  const isCurrent = currentSong?.id === song.id;
  const isLiked = likedSongIds.includes(song.id);

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
        >
          <Heart size={18} fill={isLiked ? "#ff4081" : "transparent"} color={isLiked ? "#ff4081" : "#bbb"} />
        </button>

        {playlists.length > 0 && (
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
        )}
      </div>
    </div>
  );
}