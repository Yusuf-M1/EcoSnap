# 🌿 EcoSnap
> **Gamifying Environmental Restoration. Snap. Report. Save Earth.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwind-css)

---

## 🌎 The Problem
Urban pollution and illegal dumping are escalating crises, yet citizens often feel powerless to act.
* **The Disconnect:** Residents see trash daily but lack an easy way to report it.
* **The Motivation Gap:** There is no incentive for individuals to go out of their way to help.
* **The Data Void:** Authorities lack real-time, verified data on waste hotspots.

## 💡 The Solution
**EcoSnap** is a full-stack web application that gamifies civic duty. It connects concerned citizens ("Helpers") directly with local authorities.
1.  **See it:** Users spot waste and snap a photo.
2.  **Map it:** Our interactive map automatically pins the precise location.
3.  **Gamify it:** Users earn **XP and Levels** for every report verified by authorities.

---

## ✨ Key Features

### 👤 For Helpers (Citizens)
* **📸 Evidence Upload:** Secure image uploading to verify reports.
* **📍 Interactive Mapping:** Drag-and-drop pins to mark exact waste locations.
* **🏆 Leveling System:** Earn points (XP) to level up from "Novice" to "Eco-Guardian."

### 🛡️ For Authorities (Admins)
* **📊 Live Dashboard:** View a real-time feed of all pending reports.
* **✅ One-Click Resolve:** Verify cleanups and automatically award points to the reporter.
* **🗺️ Location Intelligence:** Visualize report clusters to allocate cleaning crews efficiently.

---

## 🛠️ Tech Stack
* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
* **Backend:** Supabase (PostgreSQL, Auth, Storage)
* **Mapping:** Leaflet.js & OpenStreetMap
* **UI/UX:** Framer Motion (Animations), Glassmorphism Design

---

## 🚀 Quick Start

### 1. Installation
Clone the repo and install dependencies.
```bash
git clone [https://github.com/yourusername/ecosnap.git](https://github.com/yourusername/ecosnap.git)
cd ecosnap
npm install --legacy-peer-deps

### 2. Environment Setup
Create a .env.local file in the root directory and add your Supabase keys:

Bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

### 3. Database Schema
Run this SQL in your Supabase SQL Editor to set up the tables and security:

<details> <summary>Click to view SQL Schema</summary>

SQL
-- Profiles Table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  role text default 'HELPER',
  points int default 0,
  level int default 1
);

-- Reports Table
create table reports (
  id uuid default gen_random_uuid() primary key,
  description text,
  location text,
  latitude float8,
  longitude float8,
  image_url text,
  status text default 'PENDING',
  author_id uuid references profiles(id),
  author_name text,
  created_at timestamp with time zone default now()
);

-- Enable Security
alter table profiles enable row level security;
alter table reports enable row level security;
create policy "Public Access" on profiles for select using (true);
create policy "Public Access" on reports for select using (true);
create policy "Authenticated Insert" on reports for insert to authenticated with check (true);
create policy "Authenticated Update" on reports for update using (true);

-- Storage Bucket
insert into storage.buckets (id, name, public) values ('report-images', 'report-images', true);
</details>

### 4. Run the App
Bash
npm run dev