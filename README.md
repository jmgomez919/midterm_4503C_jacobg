# MyLiterary

A personal media tracker for movies and books, built with React, Vite, and Supabase.

## Features

- **Authentication** — Sign up and sign in with email/password via Supabase Auth
- **Media Library** — Browse a curated list of movies and books
- **Your Additions** — Add custom media entries with title, type, genre, and notes
- **Favorites** — Mark and view your favorite titles
- **Image Uploads** — Attach cover images to any media entry via Cloudinary
- **Collapsible Sections** — Clean, organized layout with expandable panels

## Tech Stack

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/) — Auth, database, and storage
- Cloudinary — Image hosting

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/jmgomez919/midterm_4503C_jacobg.git
   cd midterm_4503C_jacobg
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   > Find these values in your Supabase Dashboard under **Settings → API**.

4. Run the database schema against your Supabase project:
   - Open the Supabase SQL editor and run the contents of `supabase/schema.sql`

5. Start the dev server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/       # UI components (AuthForm, MediaList, AddMediaForm, etc.)
├── hooks/            # Custom hooks (useAuth, useFavorites, useCustomMedia, useMediaImages)
├── lib/
│   └── supabase.js   # Supabase client singleton
├── data/
│   └── mediaData.js  # Static media library data
├── App.jsx
└── main.jsx
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public API key |

> **Note:** Never commit your `.env` file. It is listed in `.gitignore`.
