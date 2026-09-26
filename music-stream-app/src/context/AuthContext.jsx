import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user) => {
    if (!user) return null;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("username, role")
        .eq("id", user.id)
        .maybeSingle();

      return {
        id: user.id,
        email: user.email,
        username: data?.username || user.email.split("@")[0],
        role: data?.role || "user",
        isAdmin: (data?.role || "user") === "admin"
      };
    } catch {
      return {
        id: user.id,
        email: user.email,
        username: user.email.split("@")[0],
        role: "user",
        isAdmin: false
      };
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setCurrentUser(profile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const profile = await fetchProfile(session.user);
          setCurrentUser(profile);
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const register = async (username, email, password) => {
    if (!supabase) return { success: false, message: "Database not configured." };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, message: error.message };

    if (data?.user) {
      await supabase.from("profiles").insert([
        { id: data.user.id, username, email, role: "user" }
      ]);
      setCurrentUser({
        id: data.user.id,
        email: data.user.email,
        username: username || email.split("@")[0],
        role: "user",
        isAdmin: false
      });
    }
    return { success: true };
  };

  const login = async (email, password) => {
    if (!supabase) return { success: false, message: "Database not configured." };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };

    if (data?.user) {
      const profile = await fetchProfile(data.user);
      setCurrentUser(profile);
    }
    return { success: true };
  };

  const logout = async () => {
    setCurrentUser(null);
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);