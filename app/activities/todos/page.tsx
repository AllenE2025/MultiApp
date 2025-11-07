"use client"

import { useEffect, useState, useContext } from "react"
import { supabase } from "../../lib/supabaseClient"
import { AuthContext } from "@/app/layout"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface Todo {
  id: string
  user_id: string
  title: string
  is_complete: boolean
  created_at: string
}

export default function TodoPage() {
  const session = useContext(AuthContext)
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [loading, setLoading] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (session === null) router.push("/")
  }, [session, router])

  // Fetch todos
  useEffect(() => {
    if (!session) return
    fetchTodos()
  }, [session])

  async function fetchTodos() {
    setLoading(true)
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", session?.user.id)
      .order("created_at", { ascending: false })

    if (error) console.error("Error fetching todos:", error.message)
    else setTodos(data || [])
    setLoading(false)
  }

  async function addTodo() {
    if (!newTodo.trim()) return
    const { error } = await supabase.from("todos").insert({
      title: newTodo,
      user_id: session?.user.id,
    })
    if (error) console.error(error)
    else {
      setNewTodo("")
      fetchTodos()
    }
  }

  async function toggleComplete(todo: Todo) {
    const { error } = await supabase
      .from("todos")
      .update({ is_complete: !todo.is_complete })
      .eq("id", todo.id)
    if (error) console.error(error)
    else fetchTodos()
  }

  async function deleteTodo(id: string) {
    const { error } = await supabase.from("todos").delete().eq("id", id)
    if (error) console.error(error)
    else fetchTodos()
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 p-8">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-8 text-green-500 text-center"
      >
        📝 To-Do List
      </motion.h1>

      {/* Rest of content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col items-center justify-start"
      >
        <div className="flex space-x-2 mb-8">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="bg-[#2a2a2a] border border-gray-700 text-gray-100 p-2 w-64 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <button
            onClick={addTodo}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow-md hover:shadow-green-500/30 active:scale-95 transition-all duration-200"
          >
            Add
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 animate-pulse">Loading tasks...</p>
        ) : todos.length === 0 ? (
          <p className="text-gray-500 italic">No tasks yet. Add one!</p>
        ) : (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md space-y-3"
          >
            {todos.map((todo) => (
              <motion.li
                key={todo.id}
                whileHover={{ scale: 1.02 }}
                className="flex justify-between items-center bg-[#1f1f1f] border border-gray-800 rounded-lg p-3 shadow-sm hover:shadow-green-500/10 transition-all duration-200"
              >
                <span
                  className={`flex-1 cursor-pointer ${
                    todo.is_complete ? "line-through text-gray-500" : "text-gray-100"
                  }`}
                  onClick={() => toggleComplete(todo)}
                >
                  {todo.title}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-400 transition-colors duration-150"
                >
                  ✕
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.main>
    </div>
  )
}
