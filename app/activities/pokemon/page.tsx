"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  user_id: string;
  pokemon_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function PokemonReviewPage() {
  const [pokemonName, setPokemonName] = useState("");
  const [pokemonData, setPokemonData] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [user, setUser] = useState<any>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"pokemon_name" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const fetchPokemon = async () => {
    setLoading(true);
    setPokemonData(null);
    setReviews([]);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
      if (!res.ok) throw new Error("Pokémon not found");
      const data = await res.json();
      setPokemonData({
        name: data.name,
        image: data.sprites.front_default,
      });
      await fetchReviews(data.name);
    } catch {
      alert("Pokémon not found. Try another name.");
    }
    setLoading(false);
  };

  const fetchReviews = async (name: string) => {
    const { data, error } = await supabase
      .from("pokemon_reviews")
      .select("*")
      .eq("pokemon_name", name)
      .order(sortBy, { ascending: sortOrder === "asc" });
    if (!error && data) setReviews(data);
  };

  useEffect(() => {
    if (pokemonData?.name) fetchReviews(pokemonData.name);
  }, [sortBy, sortOrder]);

  const handleSubmitReview = async () => {
    if (!user) return alert("Please log in first!");
    if (!pokemonData) return alert("Search a Pokémon first!");
    if (!newReview.trim()) return;

    if (editingReview) {
      const { error } = await supabase
        .from("pokemon_reviews")
        .update({ comment: newReview, rating })
        .eq("id", editingReview.id)
        .eq("user_id", user.id);
      if (!error) {
        setEditingReview(null);
        setNewReview("");
        fetchReviews(pokemonData.name);
      }
    } else {
      const { error } = await supabase.from("pokemon_reviews").insert([
        { user_id: user.id, pokemon_name: pokemonData.name, rating, comment: newReview },
      ]);
      if (!error) {
        setNewReview("");
        fetchReviews(pokemonData.name);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("pokemon_reviews")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (!error && pokemonData) fetchReviews(pokemonData.name);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8 bg-[#121212] text-gray-100">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-6 text-green-400 text-center"
      >
        Pokémon Review App
      </motion.h1>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex gap-2 mb-6"
      >
        <input
          type="text"
          placeholder="Search Pokémon by name..."
          value={pokemonName}
          onChange={(e) => setPokemonName(e.target.value)}
          className="bg-[#1f1f1f] border border-gray-700 rounded-lg p-2 w-64 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={fetchPokemon}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded-lg transition"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </motion.div>

      {/* Pokémon Info */}
      {pokemonData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mb-8"
        >
          <img
            src={pokemonData.image}
            alt={pokemonData.name}
            className="mx-auto w-32 h-32 object-contain"
          />
          <h2 className="text-2xl font-semibold capitalize mt-2">{pokemonData.name}</h2>
        </motion.div>
      )}

      {/* Review Form */}
      {pokemonData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-[#1f1f1f] p-4 rounded-lg shadow-md w-full max-w-md mb-8 border border-gray-700"
        >
          <h3 className="text-xl font-semibold mb-3 text-green-400">
            {editingReview ? "Edit Your Review" : "Add a Review"}
          </h3>

          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Write your review..."
            className="bg-[#121212] border border-gray-700 p-2 w-full rounded-lg mb-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <div className="flex items-center justify-between">
            <label className="text-gray-100">
              Rating:
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="border border-gray-700 p-1 w-16 ml-2 rounded-md bg-[#121212] text-gray-100"
              />
            </label>

            <button
              onClick={handleSubmitReview}
              className="bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded-lg transition"
            >
              {editingReview ? "Update" : "Submit"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Sorting Controls */}
      {pokemonData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex gap-4 mb-4 items-center"
        >
          <label className="text-gray-100">
            Sort by:
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "pokemon_name" | "created_at")}
              className="bg-[#1f1f1f] border border-gray-700 text-gray-100 rounded p-2 ml-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="pokemon_name">Pokémon Name</option>
              <option value="created_at">Upload Date</option>
            </select>
          </label>

          <label className="text-gray-100">
            Order:
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="bg-[#1f1f1f] border border-gray-700 text-gray-100 rounded p-2 ml-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </motion.div>
      )}

      {/* Reviews List */}
      {pokemonData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <h3 className="text-xl font-semibold mb-3 text-green-400">Reviews</h3>
          {reviews.length === 0 ? (
            <motion.p
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No reviews yet. Be the first!
            </motion.p>
          ) : (
            <AnimatePresence>
              {reviews.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#1f1f1f] border border-gray-700 rounded-lg p-4 mb-3 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-100">⭐ {r.rating} / 5</p>
                    {user?.id === r.user_id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingReview(r);
                            setNewReview(r.comment);
                            setRating(r.rating);
                          }}
                          className="text-green-400 hover:text-green-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-100 mt-2">{r.comment}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </div>
  );
}
