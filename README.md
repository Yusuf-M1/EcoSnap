# EcoSnap 🌿

**Snap. Report. Save Earth.**

EcoSnap is a community-driven platform that empowers citizens to report environmental issues and helps authorities manage cleanup operations efficiently.

---

## Features

### For Citizens (Helpers)
- 📸 **Report Issues** - Snap photos of waste and pollution
- 📍 **Precise Locations** - GPS-tagged reports for accurate tracking
- 🎮 **Gamification** - Earn points and level up for community contributions
- 📊 **Track Impact** - See how your reports lead to real change

### For Authorities
- 🛡️ **Dashboard** - Manage all community reports in one place
- ✅ **Resolve Reports** - Mark issues as resolved and award points to helpers
- 📈 **Analytics** - Track city cleanliness trends
- 🗺️ **Map View** - Visualize all reports geographically

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS + Custom Glassmorphism
- **Animations**: Framer Motion
- **Maps**: Leaflet + React Leaflet
- **UI Components**: Sonner (Toast notifications)

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd EcoSnap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```
   
   Then update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   
   Create the following tables in your Supabase project:

   **profiles table:**
   ```sql
   create table profiles (
     id uuid references auth.users on delete cascade primary key,
     username text not null,
     role text not null check (role in ('HELPER', 'AUTHORITY')),
     points integer default 0,
     level integer default 1,
     created_at timestamp with time zone default now()
   );
   ```

   **reports table:**
   ```sql
   create table reports (
     id uuid default gen_random_uuid() primary key,
     description text not null,
     location text not null,
     image_url text,
     status text default 'PENDING' check (status in ('PENDING', 'RESOLVED')),
     author_id uuid references profiles(id) on delete cascade,
     author_name text not null,
     created_at timestamp with time zone default now()
   );
   ```

   **Create storage bucket** for report images:
   - Go to Supabase Storage
   - Create a public bucket named `report-images`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
EcoSnap/
├── app/
│   ├── authority/         # Authority dashboard
│   ├── helper/            # Helper dashboard
│   ├── services/          # API service layer
│   ├── utils/             # Utilities and constants
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Landing page
├── components/            # Reusable React components
├── hooks/                 # Custom React hooks
├── public/                # Static assets
└── .env.local            # Environment variables (not in git)
```

---

## Key Features Implementation

### Authentication Flow
- Email/password signup with Supabase Auth
- Role-based access control (Helper vs Authority)
- Protected routes with authentication checks

### Gamification System
- Points awarded for:
  - Submitting reports: +10 points (pending)
  - Report resolved: +20 points
- Level calculation: `floor(points / 100) + 1`

### Image Upload
- Direct upload to Supabase Storage
- Preview before submission
- Public URLs for easy access

### Service Layer Architecture
All database operations are abstracted into services:
- `reportService` - Report CRUD operations
- `profileService` - User profile management

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

> ⚠️ **Security Note**: Never commit `.env.local` to version control. API keys should only exist in `.env.local` locally and in your hosting provider's environment variables in production.

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Compatible with any Next.js hosting provider:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

---

**Built with 💚 for a cleaner planet**
