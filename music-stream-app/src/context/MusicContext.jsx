import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { DEFAULT_SONGS } from "../data/defaultSongs";
import { useAuth } from "./AuthContext";

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const audioRef = useRef(new Audio());

  const [songs, setSongs] = useState(() => {
    const saved = localStorage.getItem("music_custom_songs");
    return saved ? [...DEFAULT_SONGS, ...JSON.parse(saved)] : DEFAULT_SONGS;
  });

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [likedSongIds, setLikedSongIds] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  // Load user data whenever currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      const userLikesKey = `music_likes_${currentUser.id}`;
      const userPlaylistsKey = `music_playlists_${currentUser.id}`;
      
      const storedLikes = JSON.parse(localStorage.getItem(userLikesKey) || "[]");
      const storedPlaylists = JSON.parse(localStorage.getItem(userPlaylistsKey) || "[]");
      
      setLikedSongIds(storedLikes);
      setPlaylists(storedPlaylists);
    } else {
      setLikedSongIds([]);
      setPlaylists([]);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [currentUser]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime || 0);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => playNext();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSongIndex, songs]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playSong = (index) => {
    if (index >= 0 && index < songs.length) {
      setCurrentSongIndex(index);
      audioRef.current.src = songs[index].url;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Playback error:", err);
        setIsPlaying(false);
      });
    }
  };

  const togglePlayPause = () => {
    if (!songs.length) return;
    if (!audioRef.current.src) {
      playSong(currentSongIndex);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Playback error:", err);
      });
    }
  };

  const playNext = () => {
    const nextIdx = (currentSongIndex + 1) % songs.length;
    playSong(nextIdx);
  };

  const playPrev = () => {
    const prevIdx = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(prevIdx);
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Fixed Like Button Handler
  const toggleLike = (songId) => {
    if (!currentUser?.id) return;
    
    setLikedSongIds((prevLikes) => {
      const isAlreadyLiked = prevLikes.includes(songId);
      const updatedLikes = isAlreadyLiked
        ? prevLikes.filter((id) => id !== songId)
        : [...prevLikes, songId];

      localStorage.setItem(`music_likes_${currentUser.id}`, JSON.stringify(updatedLikes));
      return updatedLikes;
    });
  };

  const createPlaylist = (name) => {
    if (!currentUser?.id || !name.trim()) return;
    const newPlaylist = { id: "pl-" + Date.now(), name, songIds: [] };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    localStorage.setItem(`music_playlists_${currentUser.id}`, JSON.stringify(updated));
  };

  const addSongToPlaylist = (playlistId, songId) => {
    if (!currentUser?.id) return;
    const updated = playlists.map((p) => {
      if (p.id === playlistId && !p.songIds.includes(songId)) {
        return { ...p, songIds: [...p.songIds, songId] };
      }
      return p;
    });
    setPlaylists(updated);
    localStorage.setItem(`music_playlists_${currentUser.id}`, JSON.stringify(updated));
  };

  const addSong = (newSongData) => {
    const created = {
      id: "song-" + Date.now(),
      title: newSongData.title,
      artist: newSongData.artist || "Unknown Artist",
      album: newSongData.album || "Single",
      duration: "Unknown",
      cover: newSongData.cover || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
      url: newSongData.url
    };
    const updatedCustom = [...JSON.parse(localStorage.getItem("music_custom_songs") || "[]"), created];
    localStorage.setItem("music_custom_songs", JSON.stringify(updatedCustom));
    setSongs((prev) => [...prev, created]);
  };

  return (
    <MusicContext.Provider
      value={{
        songs,
        currentSong: songs[currentSongIndex],
        currentSongIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        likedSongIds,
        playlists,
        setVolume,
        playSong,
        togglePlayPause,
        playNext,
        playPrev,
        seek,
        toggleLike,
        createPlaylist,
        addSongToPlaylist,
        addSong
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);