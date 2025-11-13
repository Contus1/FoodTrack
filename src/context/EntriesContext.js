import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import supabase from "../utils/supabaseClient";
import { useAuth } from "./AuthContext";

const EntriesContext = createContext();

export const useEntries = () => {
  const context = useContext(EntriesContext);
  if (!context) {
    throw new Error("useEntries must be used within an EntriesProvider");
  }
  return context;
};

export const EntriesProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchEntries = useCallback(
    async (limit = 50, offset = 0) => {
      if (!user) {
        setEntries([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Fetch only essential fields for list view, with pagination
        const { data, error } = await supabase
          .from("entries")
          .select(
            "id, title, rating, tags, location, photo_url, created_at, is_private",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error("Error fetching entries:", error);
          setEntries([]);
        } else {
          if (offset === 0) {
            setEntries(data || []);
          } else {
            // Append for pagination
            setEntries((prev) => [...prev, ...(data || [])]);
          }
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // Auto-fetch entries when user changes
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async (entryData) => {
    if (!user) return { error: "User not authenticated" };

    try {
      const { data, error } = await supabase
        .from("entries")
        .insert([
          {
            ...entryData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setEntries((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error("Error adding entry:", error);
      return { data: null, error };
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("food-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("food-images")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const uploadImages = async (files) => {
    if (!files || files.length === 0) return [];

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage
          .from("food-images")
          .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("food-images")
          .getPublicUrl(fileName);

        return urlData.publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      return urls.filter(url => url !== null);
    } catch (error) {
      console.error("Error uploading images:", error);
      return [];
    }
  };

  const deleteEntry = async (entryId) => {
    if (!user) return { error: "User not authenticated" };

    try {
      const { error } = await supabase
        .from("entries")
        .delete()
        .eq("id", entryId)
        .eq("user_id", user.id);

      if (error) throw error;

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      return { error: null };
    } catch (error) {
      console.error("Error deleting entry:", error);
      return { error };
    }
  };

  const updateEntry = async (entryId, entryData) => {
    console.log("UpdateEntry called with:", { entryId, entryData });
    try {
      if (!user) {
        console.error("No user found for updating entry");
        throw new Error("User not authenticated");
      }

      console.log("Updating entry in database...");
      const { data, error } = await supabase
        .from("entries")
        .update({
          title: entryData.title,
          rating: entryData.rating,
          tags: entryData.tags,
          notes: entryData.notes,
          location: entryData.location,
          photo_url: entryData.photo_url,
          tagged_friends: entryData.tagged_friends || [],
        })
        .eq("id", entryId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Database update error:", error);
        throw error;
      }

      console.log("Database update successful:", data);
      // Update local state
      setEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.id === entryId ? { ...entry, ...data } : entry,
        ),
      );

      console.log("Local state updated");
      return { data, error: null };
    } catch (error) {
      console.error("Error updating entry:", error);
      return { data: null, error };
    }
  };
  const value = {
    entries,
    loading,
    fetchEntries,
    addEntry,
    uploadImage,
    uploadImages,
    deleteEntry,
    updateEntry,
  };

  return (
    <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>
  );
};
