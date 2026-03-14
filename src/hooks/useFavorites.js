import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

// Manages the user's favorites list, persisted in Supabase.
// Accepts the current user object from useAuth.
// When user is null (logged out), the list stays empty.
function useFavorites(user) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading]     = useState(false)

  // Re-fetch favorites whenever the logged-in user changes
  useEffect(() => {
    if (!user) {
      setFavorites([])
      return
    }
    fetchFavorites()
  }, [user])

  async function fetchFavorites() {
    setLoading(true)
    const { data, error } = await supabase
      .from('favorites')
      .select('media_data')       // we only need the stored item snapshot
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      // Each row has a media_data jsonb column — unwrap it into a flat array
      setFavorites(data.map((row) => row.media_data))
    }
    setLoading(false)
  }

  // Adds or removes an item from favorites.
  // Uses optimistic updates so the UI responds instantly, then syncs to Supabase.
  async function toggleFavorite(item) {
    // media_id is stored as a string to handle both numeric (sample) and UUID (custom) ids
    const mediaId      = String(item.id)
    const alreadySaved = favorites.some((f) => String(f.id) === mediaId)

    if (alreadySaved) {
      // Optimistic: remove from local state immediately
      setFavorites((prev) => prev.filter((f) => String(f.id) !== mediaId))

      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('media_id', mediaId)
    } else {
      // Optimistic: add to local state immediately
      setFavorites((prev) => [...prev, item])

      await supabase
        .from('favorites')
        .insert({ user_id: user.id, media_id: mediaId, media_data: item })
    }
  }

  return { favorites, loading, toggleFavorite }
}

export default useFavorites
