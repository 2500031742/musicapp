import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { DEFAULT_SONGS } from "../data/defaultSongs";
import { useAuth } from "./AuthContext";

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const audioRef = useRef(null);

  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
  }

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

  // Load user data on user switch
  useEffect(() => {
    if (currentUser?.id) {
      const storedLikes = JSON.parse(localStorage.getItem(`music_likes_${currentUser.id}`) || "[]");
      const storedPlaylists = JSON.parse(localStorage.getItem(`music_playlists_${currentUser.id}`) || "[]");
      setLikedSongIds(storedLikes);
      setPlaylists(storedPlaylists);
    } else {
      setLikedSongIds([]);
      setPlaylists([]);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        setIsPlaying(false);
      }
    }
  }, [currentUser]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => playNext();
    const onError = (e) => {
      console.warn("Audio playback error:", audio.src, e);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [currentSongIndex, songs]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playSong = async (index) => {
    if (index < 0 || index >= songs.length) return;
    const audio = audioRef.current;
    setCurrentSongIndex(index);

    try {
      audio.pause();
      audio.src = songs[index].url;
      audio.load();
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Playback failed for:", songs[index].url, err);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    if (!songs.length) return;
    const audio = audioRef.current;

    if (!audio.src || audio.src === window.location.href) {
      playSong(currentSongIndex);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Error resuming audio:", err);
      }
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

  const toggleLike = (songId) => {
    if (!currentUser?.id) return;
    setLikedSongIds((prevLikes) => {
      const isLiked = prevLikes.includes(songId);
      const updated = isLiked ? prevLikes.filter((id) => id !== songId) : [...prevLikes, songId];
      localStorage.setItem(`music_likes_${currentUser.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  // --- PLAYLIST OPERATIONS ---
  const createPlaylist = (name) => {
    if (!currentUser?.id || !name.trim()) return;
    const newPlaylist = { id: "pl-" + Date.now(), name, songIds: [] };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    localStorage.setItem(`music_playlists_${currentUser.id}`, JSON.stringify(updated));
  };

  const deletePlaylist = (playlistId) => {
    if (!currentUser?.id) return;
    const updated = playlists.filter((p) => p.id !== playlistId);
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

  const removeSongFromPlaylist = (playlistId, songId) => {
    if (!currentUser?.id) return;
    const updated = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, songIds: p.songIds.filter((id) => id !== songId) };
      }
      return p;
    });
    setPlaylists(updated);
    localStorage.setItem(`music_playlists_${currentUser.id}`, JSON.stringify(updated));
  };

  // --- SONG LIBRARY OPERATIONS ---
  const addSong = (newSongData) => {
    const created = {
      id: "song-" + Date.now(),
      title: newSongData.title,
      artist: newSongData.artist || "Unknown Artist",
      album: newSongData.album || "Single",
      duration: "0:00",
      cover: newSongData.cover || "/covers/cover1.jpg",
      url: newSongData.url
    };
    const currentCustom = JSON.parse(localStorage.getItem("music_custom_songs") || "[]");
    const updatedCustom = [...currentCustom, created];
    localStorage.setItem("music_custom_songs", JSON.stringify(updatedCustom));
    setSongs((prev) => [...prev, created]);
  };

  const deleteSong = (songId) => {
    // Delete from custom songs
    const currentCustom = JSON.parse(localStorage.getItem("music_custom_songs") || "[]");
    const updatedCustom = currentCustom.filter((s) => s.id !== songId);
    localStorage.setItem("music_custom_songs", JSON.stringify(updatedCustom));

    // Remove from in-memory state
    setSongs((prev) => prev.filter((s) => s.id !== songId));

    // Cleanup from playlists
    if (currentUser?.id) {
      const updatedPlaylists = playlists.map((pl) => ({
        ...pl,
        songIds: pl.songIds.filter((id) => id !== songId)
      }));
      setPlaylists(updatedPlaylists);
      localStorage.setItem(`music_playlists_${currentUser.id}`, JSON.stringify(updatedPlaylists));

      // Cleanup from likes
      const updatedLikes = likedSongIds.filter((id) => id !== songId);
      setLikedSongIds(updatedLikes);
      localStorage.setItem(`music_likes_${currentUser.id}`, JSON.stringify(updatedLikes));
    }
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
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        addSong,
        deleteSong
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);