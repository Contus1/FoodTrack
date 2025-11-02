import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEntries } from "../context/EntriesContext";
import BottomNavigation from "../components/BottomNavigation";
import StarRating from "../components/StarRating";
import LocationAutocomplete from "../components/LocationAutocomplete";
import DishAutocomplete from "../components/DishAutocomplete";
import { compressImage, shouldCompress } from "../utils/imageOptimization";
import { getOrCreateDish } from "../utils/dishManager";
import supabase from "../utils/supabaseClient";
import { useSocial } from "../context/SocialContext";

const AddEntry = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addEntry, updateEntry, uploadImage, entries, deleteEntry } =
    useEntries();
  const { friends } = useSocial();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const viewId = searchParams.get("view");
  const isEditing = !!editId;
  const isViewing = !!viewId;
  const entryId = editId || viewId;

  const [formData, setFormData] = useState({
    title: "",
    rating: 10,
    tags: [],
    notes: "",
    location: "",
    photo_url: "",
    is_private: false, // Default to public posts
    tagged_friends: [], // Array of friend user IDs
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);

  // Debug friends data
  useEffect(() => {
    console.log("Friends data in AddEntry:", friends);
    console.log("Friends count:", friends?.length);
  }, [friends]);

  // Load entry data for editing or viewing
  useEffect(() => {
    const loadEntry = async () => {
      console.log("Edit/View effect triggered:", {
        isEditing,
        isViewing,
        entryId,
        entriesLength: entries.length,
      });

      // For viewing mode, fetch directly from database (might be someone else's entry)
      if (isViewing && entryId) {
        try {
          console.log("Fetching entry from database for viewing:", entryId);
          const { data, error } = await supabase
            .from("entries")
            .select("*")
            .eq("id", entryId)
            .single();

          if (error) {
            console.error("Error fetching entry:", error);
            alert("Could not load entry");
            navigate(-1);
            return;
          }

          if (data) {
            console.log("Loaded entry for viewing:", data);
            setFormData({
              title: data.title || "",
              rating: data.rating || 10,
              tags: data.tags || [],
              notes: data.notes || "",
              location: data.location || "",
              photo_url: data.photo_url || "",
              is_private: data.is_private || false,
              tagged_friends: data.tagged_friends || [],
            });
          }
        } catch (error) {
          console.error("Error loading entry:", error);
          alert("Could not load entry");
          navigate(-1);
        }
        return;
      }

      // For editing mode, use entries from context (only your own entries)
      if (isEditing && entries.length > 0) {
        const entryToLoad = entries.find((entry) => entry.id === entryId);
        console.log("Entry to edit from context:", entryToLoad);
        if (entryToLoad) {
          setFormData({
            title: entryToLoad.title || "",
            rating: entryToLoad.rating || 10,
            tags: entryToLoad.tags || [],
            notes: entryToLoad.notes || "",
            location: entryToLoad.location || "",
            photo_url: entryToLoad.photo_url || "",
            is_private: entryToLoad.is_private || false,
            tagged_friends: entryToLoad.tagged_friends || [],
          });
          console.log("Form data set for editing");
        } else {
          console.log("Entry not found with ID:", entryId);
        }
      }
    };

    loadEntry();
  }, [isEditing, isViewing, entryId, entries, navigate]);

  const commonTags = [
    "Spicy",
    "Sweet",
    "Savory",
    "Vegetarian",
    "Vegan",
    "Healthy",
    "Comfort Food",
    "Asian",
    "Italian",
    "Mexican",
  ];

  // Enhanced tag categories for better organization
  const tagCategories = {
    Cuisines: [
      "Italian",
      "Chinese",
      "Japanese",
      "Mexican",
      "Indian",
      "Thai",
      "French",
      "Greek",
      "Korean",
      "Vietnamese",
      "American",
      "Mediterranean",
      "Spanish",
      "Turkish",
      "Middle Eastern",
    ],
    Flavors: [
      "Spicy",
      "Sweet",
      "Savory",
      "Sour",
      "Bitter",
      "Umami",
      "Salty",
      "Tangy",
      "Smoky",
      "Creamy",
      "Rich",
      "Fresh",
    ],
    Dietary: [
      "Vegetarian",
      "Vegan",
      "Gluten-Free",
      "Dairy-Free",
      "Keto",
      "Low-Carb",
      "High-Protein",
      "Organic",
      "Halal",
      "Kosher",
    ],
    "Meal Type": [
      "Breakfast",
      "Brunch",
      "Lunch",
      "Dinner",
      "Snack",
      "Dessert",
      "Appetizer",
      "Main Course",
      "Side Dish",
    ],
    "Cooking Method": [
      "Grilled",
      "Fried",
      "Baked",
      "Steamed",
      "Roasted",
      "Raw",
      "Stir-Fried",
      "Slow-Cooked",
      "BBQ",
      "Deep-Fried",
    ],
    Protein: [
      "Chicken",
      "Beef",
      "Pork",
      "Seafood",
      "Fish",
      "Lamb",
      "Tofu",
      "Eggs",
      "Beans",
      "Cheese",
    ],
    Occasion: [
      "Date Night",
      "Family Meal",
      "Casual",
      "Fine Dining",
      "Street Food",
      "Fast Food",
      "Home Cooked",
      "Restaurant",
      "Food Truck",
      "Takeout",
    ],
    Popular: [
      "Comfort Food",
      "Healthy",
      "Indulgent",
      "Light",
      "Filling",
      "Refreshing",
      "Exotic",
      "Traditional",
      "Fusion",
      "Trendy",
    ],
  };

  // Get all tags as flat array for suggestions
  const allAvailableTags = Object.values(tagCategories).flat();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompressing(true);
      try {
        // Compress image if it's larger than 1MB
        const fileToUse = shouldCompress(file)
          ? await compressImage(file, {
              maxWidth: 1200,
              maxHeight: 1200,
              quality: 0.85,
            })
          : file;

        setSelectedFile(fileToUse);
        // Create preview URL
        const previewUrl = URL.createObjectURL(fileToUse);
        setFormData((prev) => ({ ...prev, photo_url: previewUrl }));
      } catch (error) {
        console.error("Error compressing image:", error);
        // Fall back to original file
        setSelectedFile(file);
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, photo_url: previewUrl }));
      } finally {
        setCompressing(false);
      }
    }
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleCustomTagAdd = () => {
    const trimmedTag = customTagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setCustomTagInput("");
    }
  };

  const handleCustomTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomTagAdd();
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this entry? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteEntry(editId);
      if (result.error) {
        console.error("Delete entry error:", result.error);
        alert("Error deleting entry: " + result.error.message);
      } else {
        console.log("Entry deleted successfully");
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Error deleting entry");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    console.log("HandleSubmit called:", { isEditing, editId, formData });
    setLoading(true);
    try {
      let photoUrl = formData.photo_url;

      // Only upload new image if file was selected
      if (selectedFile) {
        photoUrl = await uploadImage(selectedFile);
      }

      // Get or create dish based on title
      let dishId = null;
      if (formData.title && formData.title.trim()) {
        try {
          const dish = await getOrCreateDish(formData.title);
          dishId = dish.id;
          console.log("Dish created/found:", dish);
        } catch (dishError) {
          console.error("Error managing dish:", dishError);
          // Continue without dish linkage if there's an error
        }
      }

      const entryData = {
        ...formData,
        photo_url: photoUrl,
        dish_id: dishId,
      };

      let result;
      if (isEditing) {
        console.log("Attempting to update entry with data:", entryData);
        result = await updateEntry(editId, entryData);
        console.log("Update entry result:", result);
      } else {
        console.log("Attempting to add new entry with data:", entryData);
        result = await addEntry(entryData);
        console.log("Add entry result:", result);
      }

      if (result.error) {
        console.error("Entry operation error:", result.error);
        alert(
          `Error ${isEditing ? "updating" : "saving"} entry: ` +
            result.error.message,
        );
      } else {
        console.log("Entry operation successful, navigating to home");
        navigate("/");
      }
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "saving"} entry:`, error);
      alert(`Error ${isEditing ? "updating" : "saving"} entry`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-16">
      {/* Sophisticated Header with Glass */}
      <div className="sticky top-0 glass-header z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="w-11 h-11 flex items-center justify-center text-gray-600 hover:text-black glass-button rounded-full interaction-smooth"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-1 h-8 bg-gradient-to-b from-gray-900 to-black rounded-full shadow-sm"></div>
              <h1 className="text-xl font-light tracking-wide text-black">
                {isViewing
                  ? "View Entry"
                  : isEditing
                    ? "Edit Entry"
                    : "New Creation"}
              </h1>
            </div>
            <div className="w-11"></div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photo Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-light text-gray-600 uppercase tracking-wider">
              Visual Documentation
            </label>
            <div className="relative group">
              {formData.photo_url ? (
                <div className="relative">
                  <img
                    src={formData.photo_url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-2xl shadow-md"
                  />
                  {!isViewing && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 interaction-smooth flex items-center justify-center rounded-2xl backdrop-blur-0 group-hover:backdrop-blur-sm">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="photo-upload"
                      />
                      <span className="opacity-0 group-hover:opacity-100 text-white font-medium text-sm transition-all duration-200 drop-shadow-md">
                        Change Photo
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center group cursor-pointer hover:border-gray-400 interaction-smooth relative glass-panel-light">
                  {!isViewing && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="photo-upload-empty"
                      disabled={compressing}
                    />
                  )}
                  {compressing ? (
                    <div className="text-center">
                      <div className="w-10 h-10 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-500 text-sm">
                        Compressing image...
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-gray-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-500 group-hover:text-gray-700 transition-colors">
                        {isViewing ? "No photo" : "Click to add photo"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Dish Name
            </label>
            <DishAutocomplete
              value={formData.title}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, title: value }))
              }
              disabled={isViewing}
              placeholder="What did you eat?"
            />
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Rating
            </label>
            <StarRating
              value={formData.rating}
              onRatingChange={
                isViewing
                  ? null
                  : (rating) => setFormData((prev) => ({ ...prev, rating }))
              }
              readonly={isViewing}
            />
          </div>

          {/* Tags - Enhanced Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Tags & Categories
              </label>
              <span className="text-xs text-gray-500">
                {formData.tags.length} selected
              </span>
            </div>

            {/* Selected Tags Display */}
            {formData.tags.length > 0 && (
              <div className="glass-card rounded-xl p-4">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-black to-gray-800 text-white rounded-full shadow-md text-sm"
                    >
                      <span>{tag}</span>
                      {!isViewing && (
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Tag Input */}
            {!isViewing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyPress={handleCustomTagKeyPress}
                  placeholder="Add custom tag... (press Enter)"
                  className="flex-1 text-sm border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black interaction-smooth shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleCustomTagAdd}
                  disabled={!customTagInput.trim()}
                  className="px-4 py-2.5 bg-black text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 interaction-smooth shadow-md text-sm font-medium"
                >
                  Add
                </button>
              </div>
            )}

            {/* Categorized Tag Suggestions */}
            {!isViewing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Quick Tags
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="text-xs text-black hover:text-gray-700 font-medium underline"
                  >
                    {showAllTags ? "Show Less" : "Show All Categories"}
                  </button>
                </div>

                {/* Show only Popular tags by default */}
                {!showAllTags && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                        Popular
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tagCategories["Popular"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-1.5 text-sm rounded-full interaction-smooth shadow-sm ${
                              formData.tags.includes(tag)
                                ? "bg-black text-white shadow-md"
                                : "glass-panel-light text-gray-700 hover:bg-white/80 border border-gray-200"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Show all categories when expanded */}
                {showAllTags && (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(tagCategories).map(([category, tags]) => (
                      <div key={category} className="glass-card rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center">
                          <span className="w-1 h-3 bg-black rounded-full mr-2"></span>
                          {category}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleTagToggle(tag)}
                              className={`px-3 py-1.5 text-sm rounded-full interaction-smooth shadow-sm ${
                                formData.tags.includes(tag)
                                  ? "bg-black text-white shadow-md"
                                  : "bg-white/60 text-gray-700 hover:bg-white border border-gray-200"
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-4">
            <label className="block text-sm font-light text-gray-600 uppercase tracking-wider">
              Location
            </label>
            <LocationAutocomplete
              value={formData.location}
              onChange={
                isViewing
                  ? null
                  : (value) =>
                      setFormData((prev) => ({ ...prev, location: value }))
              }
              placeholder="Where did you enjoy this?"
              className="w-full"
              disabled={isViewing}
            />
          </div>

          {/* Tag Friends */}
          {!isViewing && friends && friends.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                With Friends
              </label>
              <div className="flex flex-wrap gap-2">
                {friends.map((friendship) => {
                  const friend = friendship.friend;
                  if (!friend) return null;

                  const isTagged = formData.tagged_friends?.includes(friend.id);
                  return (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          tagged_friends: isTagged
                            ? prev.tagged_friends.filter(
                                (id) => id !== friend.id,
                              )
                            : [...(prev.tagged_friends || []), friend.id],
                        }));
                      }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-full interaction-smooth ${
                        isTagged
                          ? "bg-blue-500 text-white shadow-md"
                          : "glass-panel-light text-gray-700 hover:bg-white/60"
                      }`}
                    >
                      {friend.avatar_url ? (
                        <img
                          src={friend.avatar_url}
                          alt={friend.display_name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white">
                          {friend.display_name?.charAt(0)?.toUpperCase() || "F"}
                        </div>
                      )}
                      <span className="text-sm">
                        {friend.display_name || friend.username}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Display Tagged Friends in View Mode */}
          {isViewing &&
            formData.tagged_friends &&
            formData.tagged_friends.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  With Friends
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.tagged_friends.map((friendId) => {
                    // Find friend info (this would need to be fetched)
                    return (
                      <div
                        key={friendId}
                        className="flex items-center space-x-2 px-3 py-2 rounded-full glass-panel-light text-gray-700"
                      >
                        <span className="text-sm">Friend</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Notes */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              disabled={isViewing}
              rows={3}
              className="w-full text-gray-700 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black interaction-smooth resize-none disabled:bg-gray-50 shadow-sm"
              placeholder="How was it? Any notes?"
            />
          </div>

          {/* Submit Buttons - iOS Control Center Style */}
          {!isViewing && (
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                {/* Cancel Button - Glass */}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex-1 py-4 glass-panel text-gray-700 rounded-2xl interaction-smooth backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] font-medium"
                >
                  Cancel
                </button>

                {/* Save Button - Glass with emphasis */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 glass-panel text-black rounded-2xl disabled:opacity-50 interaction-smooth backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.25)] font-semibold border border-white/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    "Save Entry"
                  )}
                </button>
              </div>

              {/* Delete Button - Glass with red tint */}
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full py-4 glass-panel text-red-600 rounded-2xl disabled:opacity-50 interaction-smooth backdrop-blur-xl shadow-[0_8px_32px_rgba(220,38,38,0.15)] hover:shadow-[0_12px_48px_rgba(220,38,38,0.25)] font-medium border border-red-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Deleting...</span>
                    </span>
                  ) : (
                    "Delete Entry"
                  )}
                </button>
              )}
            </div>
          )}

          {/* View-only mode close button */}
          {isViewing && (
            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full py-4 glass-panel text-black rounded-2xl interaction-smooth backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.25)] font-semibold border border-white/20"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default AddEntry;
