

# Campus District — Phase 1 MVP Build Plan

## Overview
A mobile-first, dark-themed web app for discovering and registering for college events. Inspired by Zomato District's premium UI. Built with React, Tailwind CSS, and Framer Motion animations using mock data.

---

## Step 1: Design System & Theme Setup
- Set up the dark color palette (Deep Charcoal #0F0F12, Dark Grey #1A1A1F, Vibrant Red #FF3B5C, etc.)
- Import Poppins and Inter fonts from Google Fonts
- Configure rounded UI elements (16–20px border radius)
- Set up gradient button styles and glassmorphism utility classes

## Step 2: Login Screen
- Centered glassmorphism card with blurred background
- "Campus District" branding with CD monogram logo and tagline
- Email input with college domain validation (e.g., .edu, .ac.in)
- Microsoft OAuth button (visual only for now)
- Gradient "Login" button with hover animation
- Error messaging for invalid domains
- Mock login that stores user info and redirects to the main app

## Step 3: Main App Layout with Bottom Navigation
- Fixed bottom navigation bar with 3 tabs: Upcoming, Registered, Profile
- Active tab highlighted with red accent
- Rounded nav bar with subtle elevation/shadow
- Smooth animated tab switching
- Persistent layout wrapper for all tabs

## Step 4: Upcoming Events Tab (Home)
- Greeting header: "Hi, [Name] 👋"
- Rounded search bar
- Horizontal scrolling filter chips: Tech, Cultural, Sports, Workshops, Fests, Hackathons
- Trending events carousel (horizontal scroll)
- "Happening This Week" section
- Event cards with: banner image, title, date/time, venue, price, register button, bookmark icon
- Hover scale animation on cards
- Skeleton loading shimmer while data loads
- Mock event data (8–10 sample events)

## Step 5: Event Registration Flow
- Tapping "Register" opens a confirmation dialog
- Shows event summary before confirming
- On confirm: confetti animation plays, event moves to "Registered" tab
- Toast notification for success

## Step 6: Registered Events Tab
- List of events the user has registered for
- Each card shows event info + "Confirmed" status badge
- Tapping a card opens a **Ticket View** with:
  - Generated QR code (using a QR library)
  - Unique ticket ID
  - Event details
  - Download ticket button
  - Share button
  - Add to calendar option
  - Subtle glowing animation on QR code

## Step 7: Profile & Past Events Tab
- Profile section: avatar, name, course, department, year, college name, edit button
- Stats row: events attended count, categories explored, streak counter
- Past events displayed in a timeline layout with "Attended" badges
- Event rating system (star rating)
- Achievement badges section (e.g., "First Event", "5 Events Attended")
- Dark/Light mode toggle
- Logout button
- App version footer

## Step 8: Polish & Animations
- Framer Motion page transitions between tabs
- Micro-interactions on buttons, cards, and icons
- Floating action button for quick event explore
- Glass overlay effects on modals
- Elevated cards with soft shadows throughout
- Smooth skeleton loading states on all data sections

---

## What's Included (Phase 1 MVP)
✅ Full dark-themed UI with Zomato District aesthetics  
✅ Mock authentication with email validation  
✅ Event browsing with search, filters, and categories  
✅ Event registration with confetti celebration  
✅ QR code ticket generation  
✅ User profile with stats and achievements  
✅ Responsive mobile-first design  
✅ Smooth animations throughout  

## What Comes Later (Phase 2+)
- Real Supabase database & authentication
- Admin dashboard for event creation
- Ticket scanning interface
- Real-time seat availability
- AI recommendations & leaderboards

