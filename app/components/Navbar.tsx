"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabaseClient"
import { useContext } from "react"
import { AuthContext } from "@/app/layout"

export default function Navbar() {
  const session = useContext(AuthContext)
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/")
  }

  async function handleDeleteAccount() {
    if (!session) return
    const confirm = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
    if (!confirm) return

    alert("Delete account functionality coming soon.")
  }

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-[#121212] text-gray-100 shadow-lg border-b border-gray-800">
      {/* Left Section */}
      <div className="flex space-x-6 items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-green-500 hover:text-green-400 transition-all duration-200"
        >
          Multiple Activities
        </Link>

        {session && (
          <>
            <Link
              href="/activities/todos"
              className="hover:text-green-400 transition-colors duration-200"
            >
              Todo
            </Link>
            <Link
              href="/activities/drive"
              className="hover:text-green-400 transition-colors duration-200"
            >
              Drive
            </Link>
            <Link
              href="/activities/food"
              className="hover:text-green-400 transition-colors duration-200"
            >
              Food
            </Link>
            <Link
              href="/activities/pokemon"
              className="hover:text-green-400 transition-colors duration-200"
            >
              Pokémon
            </Link>
            <Link
              href="/activities/notes"
              className="hover:text-green-400 transition-colors duration-200"
            >
              Notes
            </Link>
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {session ? (
          <>
            <span className="text-sm text-gray-400">{session.user.email}</span>

            <button
              onClick={handleSignOut}
              className="bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded-md text-sm font-medium text-white shadow-md hover:shadow-green-500/30 transition-all duration-200"
            >
              Logout
            </button>

            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-md text-sm font-medium text-white shadow-md hover:shadow-red-500/30 transition-all duration-200"
            >
              Delete
            </button>
          </>
        ) : (
          <Link
            href="/"
            className="bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded-md text-sm font-medium text-white shadow-md hover:shadow-green-500/30 transition-all duration-200"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
