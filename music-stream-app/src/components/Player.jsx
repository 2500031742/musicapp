import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart
} from "lucide-react";
import { useMusic } from "../context/MusicContext";

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function Player() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    toggleLike,
    likedSongIds
  } = useMusic();

  if (!currentSong) return null;

  const isLiked = likedSongIds.includes(currentSong.id);

  return (
    <footer className="player-bar">
      {/* Track Info */}
      <div className="player-track-info">
        <img src={currentSong.cover} alt={currentSong.title} />
        <div>
          <h4>{currentSong.title}</h4>
          <p>{currentSong.artist}</p>
        </div>
        <button
          className="icon-btn"
          onClick={() => toggleLike(currentSong.id)}
        >
          <Heart size={20} fill={isLiked ? "#ff4081" : "transparent"} color={isLiked ? "#ff4081" : "#aaa"} />
        </button>
      </div>

      {/* Main Controls & Progress */}
      <div className="player-center">
        <div className="controls">
          <button className="control-btn" onClick={playPrev}>
            <SkipBack size={20} />
          </button>
          <button className="play-toggle-btn" onClick={togglePlayPause}>
            {isPlaying ? <Pause size={22} /> : <Play size={22} fill="#000" />}
          </button>
          <button className="control-btn" onClick={playNext}>
            <SkipForward size={20} />
          </button>
        </div>

        <div className="timeline-container">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="timeline-slider"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="player-volume">
        <button
          className="icon-btn"
          onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
        >
          {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="volume-slider"
        />
      </div>
    </footer>
  );
}