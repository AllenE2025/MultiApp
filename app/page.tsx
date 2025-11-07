"use client"

import { useEffect, useState } from "react"
import { supabase } from "./lib/supabaseClient"
import { useRouter } from "next/navigation"
import Navbar from "./components/Navbar"
import { motion } from "framer-motion"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert("Signup successful! Check your email to confirm.")
  }

  if (!user) {
    // Not authenticated
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col justify-center items-center bg-[#121212] text-gray-100"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-[#1f1f1f] p-8 rounded-2xl shadow-lg w-80 border border-gray-800"
        >
          <h1 className="text-3xl font-bold mb-6 text-center text-green-500">Login / Signup</h1>

          <input
            type="email"
            placeholder="Email"
            className="bg-[#2a2a2a] text-gray-100 border border-gray-700 rounded-md p-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-[#2a2a2a] text-gray-100 border border-gray-700 rounded-md p-2 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-green-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogin}
              className="bg-green-600 hover:bg-green-500 active:scale-95 text-white py-2 rounded-md font-semibold shadow-md hover:shadow-green-500/30 transition-all duration-200"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              className="bg-gray-700 hover:bg-gray-600 active:scale-95 text-white py-2 rounded-md font-semibold shadow-md transition-all duration-200"
            >
              Sign Up
            </button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Authenticated
  return (
    <div className="min-h-screen bg-[#121212] text-gray-100">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center py-24 px-4"
      >
        <h1 className="text-4xl font-bold mb-4 text-green-500">
          Welcome, {user.email?.split("@")[0]} 👋
        </h1>
        <p className="text-gray-400 text-center max-w-md">
          Use the navigation bar to explore different activities like your To-Do List, Drive, Food Reviews, Pokémon Reviews, and Markdown Notes.
        </p>
      </motion.div>
    </div>
  )
}
