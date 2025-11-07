"use client"

import "./globals.css"
import { createContext, useEffect, useState } from "react"
import { supabase } from "./lib/supabaseClient"
import { usePathname } from "next/navigation"
import Navbar from "./components/Navbar"

export const AuthContext = createContext<any>(null)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const showNavbar = session && pathname !== "/" && pathname !== "/auth"

  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <AuthContext.Provider value={session}>
          {showNavbar && <Navbar />}
          <main>{children}</main>
        </AuthContext.Provider>
      </body>
    </html>
  )
}
