import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { DEFAULT_SONGS } from "../data/defaultSongs";
import { useAuth } from "./AuthContext";
import { supabase } from "../supabaseClient";

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const audioRef = useRef(null);

  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
  }

  const [songs, setSongs] = useState(DEFAULT_SONGS);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [likedSongIds, setLikedSongIds] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  // Fetch Cloud Songs, Liked IDs, and Playlists when user logs in
  useEffect(() => {
    if (!currentUser) {
      setSongs(DEFAULT_SONGS);
      setLikedSongIds([]);
      setPlaylists([]);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        setIsPlaying(false);
      }
      return;
    }

    const fetchData = async () => {
      // 1. Fetch Cloud Songs
      const { data: dbSongs } = await supabase.from("songs").select("*");
      if (dbSongs && dbSongs.length > 0) {
        setSongs([...DEFAULT_SONGS, ...dbSongs]);
      } else {
        setSongs(DEFAULT_SONGS);
      }

      // 2. Fetch User Likes
      const { data: dbLikes } = await supabase
        .from("likes")
        .select("song_id")
        .eq("user_id", currentUser.id);
      if (dbLikes) {
        setLikedSongIds(dbLikes.map((item) => item.song_id));
      }

      // 3. Fetch User Playlists
      const { data: dbPlaylists } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", currentUser.id);
      if (dbPlaylists) {
        setPlaylists(
          dbPlaylists.map((p) => ({
            id: p.id,
            name: p.name,
            songIds: p.song_ids || []
          }))
        );
      }
    };

    fetchData();
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
        console.error("Error resuming playback:", err);
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

  // Cloud Liked Songs Toggle
  const toggleLike = async (songId) => {
    if (!currentUser?.id) return;
    const isLiked = likedSongIds.includes(songId);

    // Optimistic UI update
    setLikedSongIds((prev) =>
      isLiked ? prev.filter((id) => id !== songId) : [...prev, songId]
    );

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .match({ user_id: currentUser.id, song_id: songId });
    } else {
      await supabase
        .from("likes")
        .insert([{ user_id: currentUser.id, song_id: songId }]);
    }
  };

  // Cloud Playlist Actions
  const createPlaylist = async (name) => {
    if (!currentUser?.id || !name.trim()) return;

    const { data } = await supabase
      .from("playlists")
      .insert([{ user_id: currentUser.id, name, song_ids: [] }])
      .select()
      .single();

    if (data) {
      setPlaylists((prev) => [...prev, { id: data.id, name: data.name, songIds: [] }]);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!currentUser?.id) return;
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    await supabase.from("playlists").delete().eq("id", playlistId);
  };

  const addSongToPlaylist = async (playlistId, songId) => {
    if (!currentUser?.id) return;
    const target = playlists.find((p) => p.id === playlistId);
    if (!target || target.songIds.includes(songId)) return;

    const updatedSongIds = [...target.songIds, songId];

    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, songIds: updatedSongIds } : p))
    );

    await supabase
      .from("playlists")
      .update({ song_ids: updatedSongIds })
      .eq("id", playlistId);
  };

  const removeSongFromPlaylist = async (playlistId, songId) => {
    if (!currentUser?.id) return;
    const target = playlists.find((p) => p.id === playlistId);
    if (!target) return;

    const updatedSongIds = target.songIds.filter((id) => id !== songId);

    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, songIds: updatedSongIds } : p))
    );

    await supabase
      .from("playlists")
      .update({ song_ids: updatedSongIds })
      .eq("id", playlistId);
  };

  // Cloud Add / Delete Custom Songs
  const addSong = async (newSongData) => {
    if (!currentUser?.id) return;

    const songPayload = {
      title: newSongData.title,
      artist: newSongData.artist || "Unknown Artist",
      album: newSongData.album || "Single",
      duration: "0:00",
      cover: newSongData.cover || "/covers/cover1.jpg",
      url: newSongData.url,
      created_by: currentUser.id
    };

    const { data } = await supabase.from("songs").insert([songPayload]).select().single();
    if (data) {
      setSongs((prev) => [...prev, data]);
    }
  };

  const deleteSong = async (songId) => {
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    await supabase.from("songs").delete().eq("id", songId);
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