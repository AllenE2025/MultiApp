"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [sortBy, setSortBy] = useState<"title" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const fetchNotes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order(sortBy, { ascending: sortOrder === "asc" });
    if (!error && data) setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, [user, sortBy, sortOrder]);

  const handleSave = async () => {
    if (!title.trim()) return alert("Title is required!");
    if (editingNote) {
      const { error } = await supabase
        .from("notes")
        .update({ title, content })
        .eq("id", editingNote.id)
        .eq("user_id", user.id);
      if (error) alert(error.message);
      else {
        setEditingNote(null);
        setTitle("");
        setContent("");
        fetchNotes();
      }
    } else {
      const { error } = await supabase.from("notes").insert([
        { user_id: user.id, title, content },
      ]);
      if (error) alert(error.message);
      else {
        setTitle("");
        setContent("");
        fetchNotes();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) alert(error.message);
    else fetchNotes();
  };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 flex flex-col items-center py-8 px-4">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-6 text-green-400 text-center"
      >
        Markdown Notes App
      </motion.h1>

      {/* Editor Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-[#1f1f1f] border border-gray-800 p-4 rounded-lg mb-8 shadow-sm w-full max-w-2xl"
      >
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-[#2a2a2a] border border-gray-700 text-gray-100 p-2 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <div className="flex justify-between mb-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="bg-green-500 text-black px-3 py-1 rounded-md hover:bg-green-600"
          >
            {previewMode ? "Raw Mode" : "Preview Mode"}
          </button>
        </div>

        {previewMode ? (
          <div className="border border-gray-700 rounded-md p-3 bg-[#2a2a2a]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || "*Nothing to preview*"}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            placeholder="Write your note in Markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-[#2a2a2a] border border-gray-700 p-2 w-full h-48 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        )}

        <button
          onClick={handleSave}
          className="bg-green-500 text-black px-4 py-2 rounded-md hover:bg-green-600 mt-4"
        >
          {editingNote ? "Update Note" : "Save Note"}
        </button>
      </motion.div>

      {/* Sort Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-2xl flex justify-between mb-4 items-center text-gray-100"
      >
        <div className="flex items-center gap-2">
          <label className="font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "title" | "created_at")}
            className="bg-[#2a2a2a] border border-gray-700 rounded px-2 py-1 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="created_at">Date</option>
            <option value="title">Title</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="bg-[#2a2a2a] border border-gray-700 rounded px-2 py-1 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </motion.div>

      {/* Notes List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-full max-w-2xl space-y-3"
      >
        <AnimatePresence>
          {notes.length === 0 ? (
            <motion.p
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No notes yet.
            </motion.p>
          ) : (
            notes.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#1f1f1f] border border-gray-800 p-4 rounded-md shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg text-gray-100">{n.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingNote(n);
                        setTitle(n.title);
                        setContent(n.content);
                        setPreviewMode(false);
                      }}
                      className="text-green-400 hover:text-green-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={n.content + n.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-700 pt-2 text-gray-100"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {n.content || "_No content_"}
                    </ReactMarkdown>
                  </motion.div>
                </AnimatePresence>

                <p className="text-gray-500 text-sm mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
