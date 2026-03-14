# MyLiterary — Project Transcript Highlights

A summary of key decisions, features built, and problems solved during the development of this app.

---

## Project Overview

**MyLiterary** is a React web application for tracking movies and books. Users can browse a sample library, add their own entries, mark favorites, upload photos, and have all their data persist across sessions via Supabase.

**Stack:** React 18 · Vite · Supabase (Auth, Database, Storage) · CSS Grid · GitHub

---

## Features Built (in order)

### 1. Project Scaffolding
- Initialized with Vite + React
- Set up `index.html`, `main.jsx`, `App.jsx`, `styles.css`

### 2. Media Library
- Created 12 sample items (movies + books) in `src/data/mediaData.js`
- Built `MediaList` and `MediaCard` components in a responsive CSS Grid layout
- Cards display: cover image, badge (movie/book), year, title, genre, description

### 3. Favorites
- Implemented `useFavorites` hook with localStorage (later migrated to Supabase)
- Favorited cards get a gold (`#ffd966`) background fill with forced black text
- Favorites section displays its own grid of favorited cards

### 4. Custom Media Entry
- Built `AddMediaForm` with fields: title, type, genre, year, description
- New entries appear in a dedicated **"Your Additions"** section above the Library
- Form validates all fields before submission

### 5. Supabase Integration
- Added `useAuth` hook for email/password sign up, sign in, sign out
- Migrated favorites and custom media from localStorage to Supabase tables
- Wrote full SQL schema with Row Level Security (RLS) policies for all tables
- Each user only sees their own data

### 6. Edit / Save / Delete
- Edit button expands a card inline with pre-filled input fields
- Two-step delete confirmation (no native browser `confirm()` dialog)
- Save/Cancel/Delete buttons with loading states (`Saving…`, `Deleting…`)
- Read-only library items have no Edit button (`onUpdate` prop is undefined)

### 7. UI Enhancements
- **Collapsible sections** for Add New Media, Your Additions, and Favorites
- **Grid / Table view toggle** for the Library (grid view = cards, table view = rows with thumbnail)
- `MediaTableRow` component mirrors `MediaCard` for the table layout

### 8. Image Uploads
- Up to 5 photos per media item, stored in Supabase Storage (`media-images` bucket)
- `useMediaImages` hook fetches all user images on login, grouped by `media_id`
- `ImageUploader` component shows local previews instantly while upload is in flight
- `ImageGallery` component displays a carousel with left/right arrows and X/Y counter
- Cover images added to all 12 sample items (Open Library API for books, Wikipedia for movies)
- Real movie poster images sourced and verified from Wikipedia for all 6 movies

### 9. Styling
- Header: `#132572` (navy blue)
- Title: `#ffd966` (gold), EB Garamond font via Google Fonts
- Body: Arial/Helvetica
- 1px black border around main content area
- App renamed from "Media Tracker" → "Miterary.com" → **"MyLiterary"**

---

## Problems Solved

### Custom media not appearing on the home page
`handleSubmit` in `AddMediaForm` was not awaiting `onAdd()`, so Supabase errors were swallowed silently and the UI appeared not to update. Fixed by making the handler async and adding visible success/error feedback.

### Supabase table not found error
The schema SQL had never been run in the Supabase dashboard. Fixed by providing step-by-step instructions to paste and run `schema.sql` in the Supabase SQL Editor.

### Edit card too narrow to show all inputs
`.card-editing` was constrained to its CSS Grid cell. Fixed by adding `grid-column: 1 / -1` so the editing card spans the full grid width, and using `repeat(auto-fit, minmax(140px, 1fr))` for the field row.

### Favorites ID mismatch
Sample items have numeric IDs (1–12); custom items use Supabase UUIDs. Comparison was failing with strict equality. Fixed by casting both sides: `String(f.id) === String(item.id)`.

### Images not displaying after upload
Three root causes identified and fixed:
1. `uploadImages` returned `undefined` — callers couldn't detect failure
2. Storage upload used `upsert: false` — caused "duplicate path" errors on retry
3. File paths had no uniqueness guarantee — fixed by including `Date.now()` timestamp
4. DB insert failures left orphaned files in Storage — cleanup added on failure
5. Added visible red error message in `ImageUploader` so the user sees what went wrong

### Supabase Storage bucket not found
The `media-images` bucket had not been created in the Supabase dashboard. Resolved by walking through bucket creation and adding INSERT / SELECT / DELETE storage policies.

### `media_images` table missing
The updated schema (with the `media_images` table) had not been run. Resolved by providing the isolated `CREATE TABLE` SQL and RLS policy to run separately in the SQL Editor.

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| Custom hooks per concern (`useAuth`, `useFavorites`, `useCustomMedia`, `useMediaImages`) | Keeps `App.jsx` clean; each hook owns its own Supabase calls and state |
| `addMedia` returns `{ success, id }` | The new Supabase UUID is needed immediately to chain image uploads |
| Optimistic favorites toggle | Updates local state before Supabase responds for instant UI feedback |
| Images ordered by `created_at`, not `position` | Avoids unique constraint violations on the `(user_id, media_id, position)` index when retrying uploads |
| `upsert: true` on storage upload | Prevents "duplicate path" errors if the same file is retried |
| Local `objectURL` previews while uploading | Makes uploads feel instant — thumbnails appear before Supabase responds |
| Static `coverImage` field on sample items | Allows the same `ImageGallery` component to render both user-uploaded and static images with no conditional logic in the component |

---

## Repository

**GitHub:** [midterm_4503C_jacobg](https://github.com/jmgomez919/midterm_4503C_jacobg)
