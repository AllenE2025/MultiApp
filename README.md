# 🧩 MultiApp

**Next.js + Supabase**

This project was built as part of a technical assessment to demonstrate skills in **Next.js**, **Supabase**, and **TypeScript**.

It includes multiple mini applications, each focusing on different Supabase and Next.js concepts such as authentication, CRUD operations, and file storage.

---

## 🚀 Tech Stack

**Frontend**

* Next.js (App Router)
* TypeScript
* Tailwind CSS

**Backend / Database**

* Supabase (Auth, Database, Storage)

**Deployment**

* Vercel

**Version Control**

* Git & GitHub

---

## 🔐 Authentication

* Uses Supabase Auth (Email + Password)
* Only authenticated users can access activity pages
* Unauthenticated users are redirected to login
* Users can log out and delete their own account

---

## 📘 Activity Details

### 📝 Activity 1: To-Do List App

A simple Supabase CRUD application.

* Each user sees only their own tasks
* Supports Create, Read, Update, Delete
* Data persists even after browser restart

---

### 🖼️ Activity 2: Google Drive "Lite"

* Users can upload, edit, delete, and view photos
* Photos stored in Supabase Storage
* Search and sort by name or upload date

---

### 🍔 Activity 3: Food Review App

* Users can CRUD food items and reviews (parent-child relationship)
* Reviews are linked to specific food items
* Sorting by food name or upload date

---

### 🧬 Activity 4: Pokémon Review App

* Fetch Pokémon details from PokéAPI
* Users can search Pokémon by name
* Each Pokémon has a list of reviews stored in Supabase
* Supports sorting by Pokémon name or upload date

---

### 📝 Activity 5: Markdown Notes App

* Users can create, edit, delete, and view notes in Markdown
* Includes raw input mode and preview mode
* Notes sorted by title or creation date

---

## 🌐 Deployment

* The app is deployed to Vercel
* Automatic builds on push to main branch
* Environment variables configured in Vercel dashboard

---

## 🧠 Concepts Demonstrated

* Next.js App Router structure (`app/` directory)
* Supabase Authentication
* Supabase CRUD Operations
* Supabase Storage
* Row-Level Security (RLS)
* Client-side API fetching (PokéAPI)
* Markdown rendering
* UI state management with React Hooks
* Protected routes and user-based data isolation
