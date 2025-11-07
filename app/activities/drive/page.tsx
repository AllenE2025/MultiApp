"use client"

import { useContext, useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { AuthContext } from "@/app/layout"
import { motion } from "framer-motion"

type Photo = {
  name: string
  url: string
  created_at: string
}

export default function DriveLite() {
  const session = useContext(AuthContext)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<"name" | "date">("date")

  const fetchPhotos = async () => {
    if (!session) return
    setLoading(true)

    const userId = session.user.id
    const { data, error } = await supabase.storage
      .from("photos")
      .list(userId + "/", { limit: 100, offset: 0, sortBy: { column: "name", order: "asc" } })

    if (error) console.error("Error fetching photos:", error)
    else {
      const filesWithUrls: Photo[] = await Promise.all(
        data.map(async (file) => {
          const { data: publicUrl } = supabase.storage
            .from("photos")
            .getPublicUrl(`${userId}/${file.name}`)
          return {
            name: file.name,
            url: publicUrl.publicUrl,
            created_at: file.created_at || new Date().toISOString(),
          }
        })
      )
      setPhotos(filesWithUrls)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchPhotos()
  }, [session])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session) return

    const userId = session.user.id
    const filePath = `${userId}/${file.name}`

    setLoading(true)
    const { error } = await supabase.storage.from("photos").upload(filePath, file)
    if (error) alert(error.message)
    else fetchPhotos()
    setLoading(false)
  }

  const handleDelete = async (photoName: string) => {
    if (!session) return
    const userId = session.user.id
    const { error } = await supabase.storage.from("photos").remove([`${userId}/${photoName}`])
    if (error) alert(error.message)
    else fetchPhotos()
  }

  const handleRename = async (oldName: string) => {
    const newName = prompt("Enter new name (with extension):", oldName)
    if (!newName || newName === oldName || !session) return

    const userId = session.user.id
    const oldPath = `${userId}/${oldName}`
    const newPath = `${userId}/${newName}`

    const { data: file } = await supabase.storage.from("photos").download(oldPath)
    if (!file) return alert("File not found")

    const { error: uploadError } = await supabase.storage.from("photos").upload(newPath, file)
    if (uploadError) return alert(uploadError.message)

    await supabase.storage.from("photos").remove([oldPath])
    fetchPhotos()
  }

  const filteredPhotos = photos
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === "name") return a.name.localeCompare(b.name)
      else return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 p-8">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-8 text-green-400 text-center"
      >
        📸 Drive Lite
      </motion.h1>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3 bg-[#2a2a2a] p-4 rounded-lg shadow-lg"
      >
        <label className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow-md cursor-pointer w-max transition">
          Choose File
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={loading}
            className="hidden"
          />
        </label>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search photos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-gray-200 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-green-400 outline-none w-52"
          />

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as "name" | "date")}
            className="bg-gray-700 border border-gray-600 rounded p-2 text-gray-200 focus:ring-2 focus:ring-green-400"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </motion.div>

      {/* Gallery */}
      {loading ? (
        <p className="text-center text-gray-400">Loading photos...</p>
      ) : filteredPhotos.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No photos found.</p>
      ) : (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {filteredPhotos.map((photo) => (
            <motion.div
              key={photo.name}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              className="bg-gray-800 p-2 rounded-lg shadow-lg hover:shadow-green-500/20 transition"
            >
              <img
                src={photo.url}
                alt={photo.name}
                className="rounded-md object-contain h-44 w-full"
              />
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="truncate w-2/3 text-gray-300">{photo.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRename(photo.name)}
                    className="text-green-400 hover:text-green-300 transition"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDelete(photo.name)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
