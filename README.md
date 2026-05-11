# WanderLog v2 — Trip Tracker with Auth & Collaboration

A Next.js application to track multiple trips with itinerary planning, cost management, user authentication, collaboration, and public sharing.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **localStorage** for persistence (swap-ready for a real DB)

## Features

### Authentication
- **Email + Password** sign-up and sign-in
- **Google Sign-In** (simulated; see production notes below)
- Persistent sessions across tabs via `localStorage`
- Auth-guarded routes — unauthenticated users are redirected to `/auth/signin`

### Trips Dashboard
- View all trips you own or collaborate on
- Status filters: Planning / Upcoming / Active / Completed
- Budget progress bars, collaborator avatars, role badges

### Trip Detail (3 tabs)
- **Overview** — summary of itinerary + costs
- **Itinerary** — add/edit/delete timeline items (flights, hotels, activities, meals, transport, notes), grouped by date, with time, location, confirmation status
- **Costs** — expenses with category breakdown, paid/unpaid toggle, budget bar

### Collaboration
- **Invite by email** — must have a WanderLog account
- **Two roles:**
  - **Editor** — can add, edit, delete itinerary items and expenses
  - **Viewer** — read-only access; no edit controls shown
- Change or revoke roles any time
- Remove collaborators
- Collaborator role badge shown in header and on dashboard cards

### Public Sharing
- Generate a **public read-only URL** (`/share/<token>`)
- No sign-in required to view shared link
- Shows full itinerary, expenses, and budget summary
- **Disable** link at any time (revoke access without deleting)
- **Regenerate** to invalidate old URL and create a new one

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to sign in.

## Project Structure

```
trip-tracker/
├── app/
│   ├── layout.tsx              # Root layout + AuthProvider
│   ├── globals.css             # Design tokens, animations
│   ├── page.tsx                # Dashboard (auth-guarded)
│   ├── auth/
│   │   ├── signin/page.tsx     # Sign-in page
│   │   └── signup/page.tsx     # Sign-up page
│   ├── trips/[id]/
│   │   └── page.tsx            # Trip detail (auth + permission-guarded)
│   └── share/[token]/
│       └── page.tsx            # Public read-only share page
├── components/
│   ├── AuthProvider.tsx        # Auth context + useAuth hook
│   ├── TripFormModal.tsx       # Create/edit trip modal
│   ├── ItineraryTab.tsx        # Itinerary (canEdit-aware)
│   ├── CostsTab.tsx            # Expenses (canEdit-aware)
│   ├── CollaboratorsModal.tsx  # Invite / manage collaborators
│   └── ShareModal.tsx          # Generate / revoke public link
└── lib/
    ├── types.ts                # TypeScript types (User, Trip, Collaborator, ShareLink…)
    ├── auth.ts                 # Sign-up, sign-in, session management
    ├── storage.ts              # CRUD + collaboration + sharing helpers
    └── utils.ts                # Formatting + constants
```

## Production: Replace Simulated Auth with NextAuth.js

The `lib/auth.ts` file uses localStorage to simulate auth. To go production-ready:

### 1. Install NextAuth
```bash
npm install next-auth @prisma/client prisma
# or use a hosted DB like PlanetScale, Supabase, Neon
```

### 2. Create `/app/api/auth/[...nextauth]/route.ts`
```ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    GoogleProvider({ clientId: process.env.GOOGLE_ID!, clientSecret: process.env.GOOGLE_SECRET! }),
    CredentialsProvider({ /* email/password logic */ }),
  ],
  // ...adapter, callbacks, etc.
});

export { handler as GET, handler as POST };
```

### 3. Set up Google OAuth
- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Create OAuth 2.0 credentials
- Set redirect URI to `http://localhost:3000/api/auth/callback/google`
- Add `GOOGLE_ID` and `GOOGLE_SECRET` to `.env.local`

### 4. Replace `lib/auth.ts` functions
Swap `signInWithEmail`, `signInWithGoogle`, `getCurrentUser`, etc. with NextAuth's `signIn()`, `signOut()`, and `getServerSession()`.

All data interfaces in `lib/types.ts` map 1:1 to NextAuth's `User` and `Session` types.

## Data Model

```typescript
Trip {
  id, ownerId, name, destination, coverEmoji,
  startDate, endDate, status, budget, currency,
  travelers, description,
  itinerary: ItineraryItem[],
  expenses: Expense[],
  collaborators: Collaborator[],  // NEW
  shareLink?: ShareLink,          // NEW
}

Collaborator { userId, email, name, role: 'editor' | 'viewer', addedAt }
ShareLink    { token, createdAt, createdBy, enabled }
```
