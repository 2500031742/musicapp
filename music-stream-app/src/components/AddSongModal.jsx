import React, { useState } from "react";
import { X } from "lucide-react";
import { useMusic } from "../context/MusicContext";

export default function AddSongModal({ onClose }) {
  const { addSong } = useMusic();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [url, setUrl] = useState("");
  const [cover, setCover] = useState("");
  const [error, setError] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setError("Title and Audio URL are required.");
      return;
    }

    addSong({ title, artist, album, url, cover });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h3>Add New Song</h3>
        <p className="modal-sub">Add any direct MP3 audio stream to your library</p>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleAdd} className="auth-form">
          <div className="form-group">
            <label>Song Title *</label>
            <input
              type="text"
              placeholder="Song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Artist</label>
            <input
              type="text"
              placeholder="Artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Album</label>
            <input
              type="text"
              placeholder="Album title"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Audio URL (.mp3 link) *</label>
            <input
              type="url"
              placeholder="https://example.com/audio.mp3"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Cover Image URL (optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={cover}
              onChange={(e) => setCover(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-submit">
            Add To Library
          </button>
        </form>
      </div>
    </div>
  );
}