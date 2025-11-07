"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import ReviewList from "./components/ReviewList"
import { motion } from "framer-motion"

export default function FoodReviewPage() {
  const [foods, setFoods] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [session, setSession] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<"name" | "created_at">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) fetchFoods(data.session.user.id)
    })
  }, [])

  useEffect(() => {
    if (session?.user) fetchFoods(session.user.id)
  }, [search, sortField, sortOrder])

  async function fetchFoods(userId: string) {
    let query = supabase
      .from("foods")
      .select("*")
      .eq("user_id", userId)
      .order(sortField, { ascending: sortOrder === "asc" })

    if (search.trim() !== "") query = query.ilike("name", `%${search}%`)

    const { data, error } = await query
    if (!error && data) setFoods(data)
  }

  async function handleUpload() {
    if (!session || !file) return
    const filePath = `${session.user.id}/${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("food-photos")
      .upload(filePath, file)

    if (uploadError) return console.error(uploadError)

    const publicUrl = supabase.storage
      .from("food-photos")
      .getPublicUrl(filePath).data.publicUrl

    await supabase.from("foods").insert({
      user_id: session.user.id,
      name,
      description,
      image_url: publicUrl,
    })

    setFile(null)
    setName("")
    setDescription("")
    fetchFoods(session.user.id)
  }

  async function deleteFood(id: string) {
    await supabase.from("foods").delete().eq("id", id)
    fetchFoods(session.user.id)
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 p-6">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-8 text-green-500 text-center"
      >
        🍽️ Food Review App
      </motion.h1>

      {/* Rest of the content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Upload Form */}
        <div className="bg-[#1f1f1f] border border-gray-800 p-4 rounded-lg mb-6 shadow-sm flex flex-col gap-3 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Food name"
            className="bg-[#2a2a2a] border border-gray-700 text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="Description"
            className="bg-[#2a2a2a] border border-gray-700 text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow-md hover:shadow-green-500/30 cursor-pointer w-max transition-all duration-200">
            {file ? file.name : "Choose File"}
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          <button
            onClick={handleUpload}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow-md hover:shadow-green-500/30 active:scale-95 transition-all duration-200 w-max"
          >
            Upload Food
          </button>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2 max-w-md mx-auto">
          <input
            type="text"
            placeholder="🔍 Search food by name"
            className="bg-[#2a2a2a] border border-gray-700 text-gray-100 p-2 rounded w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              className="bg-[#2a2a2a] border border-gray-700 text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as "name" | "created_at")}
            >
              <option value="created_at">Upload Date</option>
              <option value="name">Food Name</option>
            </select>
            <select
              className="bg-[#2a2a2a] border border-gray-700 text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Food List */}
        <div className="space-y-4">
          {foods.length === 0 ? (
            <p className="text-gray-500 text-center italic">No foods found.</p>
          ) : (
            foods.map((food) => (
              <motion.div
                key={food.id}
                className="bg-[#1f1f1f] border border-gray-800 p-3 rounded-lg shadow-sm max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={food.image_url}
                  alt={food.name}
                  className="w-full rounded-lg mb-2 object-contain max-h-80"
                />
                <h2 className="text-lg font-semibold mb-1 text-gray-100">{food.name}</h2>
                <p className="text-gray-100 mb-1 text-sm">{food.description}</p>
                <p className="text-xs text-gray-500 mb-2">
                  Uploaded: {new Date(food.created_at).toLocaleString()}
                </p>
                <button
                  onClick={() => deleteFood(food.id)}
                  className="text-red-500 text-sm mb-3 hover:text-red-400 transition-all duration-150"
                >
                  Delete
                </button>

                {session?.user && <ReviewList foodId={food.id} userId={session.user.id} />}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
