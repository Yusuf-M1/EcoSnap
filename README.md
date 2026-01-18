🌿 Project Title: EcoSnap
Tagline: Gamifying Environmental Restoration. Snap. Report. Save Earth.

1. The Problem (The "Why")
Environmental pollution—specifically urban waste and illegal dumping—is a massive global crisis. While many citizens witness these issues daily, they often lack the motivation or the tools to do anything about it.

The Disconnect: Citizens feel powerless to report issues effectively.

The Motivation Gap: There is no incentive for individuals to go out of their way to report or clean up trash.

The Data Void: Local authorities (sanitation departments) often lack real-time, verified data on where waste hotspots are located.

EcoSnap was built to bridge this gap. It turns environmental responsibility into a rewarding, interactive game, connecting concerned citizens ("Helpers") directly with cleaning officials ("Authorities").

2. The Solution (The "What")
EcoSnap is a full-stack web application that gamifies the process of waste reporting and cleanup. It creates a symbiotic ecosystem between two distinct user roles:

The Helper (Citizen): Users who spot trash, report it via the app, and earn XP (Experience Points) and Levels for their contributions.

The Authority (Official): Admin users who view these reports on a dashboard, verify the issues, and mark them as "Resolved," which triggers the reward system for the Helper.

By combining civic duty with gamification, EcoSnap drives behavioral change, making environmental stewardship addictive and fun.

3. How It Works (The User Flow)
Phase 1: Authentication & Role Selection
New users sign up and are immediately asked to identify their role: Helper or Authority.

Tech Detail: We use Supabase Auth to handle secure login/signup. Upon registration, a trigger (or API call) automatically creates a corresponding entry in our public profiles database table, storing their Role, Points (0), and Level (1).

Phase 2: Reporting (The Helper's Journey)
A Helper logs in and sees their Gamified Dashboard, displaying their current Level and XP.

They encounter a pile of trash. They use the "Snap & Report" feature.

Input: They provide a description (e.g., "Plastic waste near river"), the location, and upload a photo (simulated in MVP).

Tech Detail: This data is pushed to the reports table in our Supabase PostgreSQL database with a status of PENDING.

Phase 3: Verification (The Authority's Journey)
An Authority logs in and sees the Admin Dashboard. This is a command center showing a live feed of all incoming reports sorted by urgency (time).

They can view the details: Description, Reporter Name, and Location.

Once the Authority confirms the cleanup crew has handled the issue (or verifies the report is valid), they click "Resolve".

Phase 4: The Reward Loop (Gamification Logic)
When "Resolve" is clicked, the backend performs two simultaneous actions:

Updates the Report status to RESOLVED.

Finds the original Helper who made the report and increments their points (e.g., +20 XP).

Leveling Up: The system automatically checks if the new point total crosses a threshold (e.g., every 100 points). If so, the user's Level increases instantly.

Feedback: The next time the Helper refreshes their dashboard, they see their new Points and Level, reinforcing the positive behavior.

4. Technical Architecture (The "How")
This project works using a modern, scalable Next.js architecture hosted in the cloud.

Frontend Framework: Next.js 14+ (React)

Used for its speed, server-side rendering capabilities, and file-based routing (app/helper vs app/authority).

Styling & UI: Tailwind CSS + Glassmorphism

We implemented a custom "Nature" design system using transparent glass cards (backdrop-filter: blur), gradients, and high-quality nature backgrounds to evoke an emotional connection to the environment.

Backend & Database: Supabase (PostgreSQL)

Acts as our "Backend-as-a-Service." It handles:

Auth: Secure email/password login.

Database: Stores relational data linking Users to Reports.

Real-time: (Future scope) capable of pushing live updates to the dashboard.

Mapping: Leaflet.js

An open-source JavaScript library used to render interactive maps, allowing users to visualize report locations geographically.

5. Future Scope & Impact
While the current MVP demonstrates the core "Report-Reward" loop, the roadmap includes:

AI Verification: Using Computer Vision (like Google Gemini Vision API) to automatically detect if a photo actually contains trash before accepting the report.

Leaderboards: A global ranking system to foster competition between neighborhoods or cities.

Redeemable Rewards: converting XP into real-world value (e.g., coupons for eco-friendly products).

EcoSnap proves that technology can turn a boring chore (cleaning up) into an engaging community mission.
