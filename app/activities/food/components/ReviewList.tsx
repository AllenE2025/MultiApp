"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../../../lib/supabaseClient"

interface Review {
  id: string
  content: string
  rating: number
  user_id: string
  created_at: string
}

interface ReviewListProps {
  foodId: string
  userId: string
}

export default function ReviewList({ foodId, userId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [content, setContent] = useState("")
  const [rating, setRating] = useState<number>(5)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [foodId])

  async function fetchReviews() {
    setLoading(true)
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("food_id", foodId)
      .order("created_at", { ascending: false })
    if (!error && data) setReviews(data)
    setLoading(false)
  }

  async function addReview() {
    if (!content.trim()) return
    const { error } = await supabase.from("reviews").insert({
      food_id: foodId,
      user_id: userId,
      content,
      rating,
    })
    if (!error) {
      setContent("")
      fetchReviews()
    }
  }

  async function deleteReview(id: string) {
    await supabase.from("reviews").delete().eq("id", id)
    fetchReviews()
  }

  async function startEdit(review: Review) {
    setEditingId(review.id)
    setEditContent(review.content)
  }

  async function updateReview() {
    if (!editingId) return
    const { error } = await supabase
      .from("reviews")
      .update({ content: editContent })
      .eq("id", editingId)
    if (!error) {
      setEditingId(null)
      setEditContent("")
      fetchReviews()
    }
  }

  return (
    <motion.div
      className="bg-[#121212] text-gray-100 rounded-2xl p-4 shadow-lg border border-gray-800 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-2xl font-bold mb-4 text-green-500">Reviews</h3>

      {/* Add new review */}
      <motion.div
        className="mb-4 flex flex-col gap-2 bg-[#1f1f1f] p-3 rounded-lg border border-gray-700 shadow-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <textarea
          placeholder="Write your review..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
        <div className="flex items-center gap-2">
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="p-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-gray-100 focus:ring-2 focus:ring-green-500 transition"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>{num} ⭐</option>
            ))}
          </select>
          <button
            onClick={addReview}
            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded shadow-md hover:shadow-green-500/30 active:scale-95 transition-all duration-200"
          >
            Add Review
          </button>
        </div>
      </motion.div>

      {/* Review list */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-gray-400 italic animate-pulse text-sm">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No reviews yet.</p>
        ) : (
          <AnimatePresence>
            {reviews.map((r) => (
              <motion.div
                key={r.id}
                className="flex flex-col bg-[#1f1f1f] border border-gray-800 p-3 rounded-lg shadow-sm hover:shadow-green-500/10 transition-all duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.25 }}
              >
                {editingId === r.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="w-full p-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-gray-100 focus:ring-2 focus:ring-green-500 transition"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={updateReview}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded shadow-md hover:shadow-green-500/30 active:scale-95 transition-all duration-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1 rounded shadow-md transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-100">{r.content}</p>
                    <p className="text-green-500 mt-1 text-sm">{r.rating} ⭐</p>
                    {r.user_id === userId && (
                      <div className="flex gap-3 mt-2 text-sm">
                        <button
                          onClick={() => startEdit(r)}
                          className="text-green-500 hover:text-green-400 transition-all duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteReview(r.id)}
                          className="text-red-500 hover:text-red-400 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
