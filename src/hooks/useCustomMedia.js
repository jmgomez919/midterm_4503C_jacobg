import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

function useCustomMedia(user) {
  const [customMedia, setCustomMedia] = useState([])
  const [loading, setLoading]         = useState(false)

  useEffect(() => {
    if (!user) { setCustomMedia([]); return }
    fetchCustomMedia()
  }, [user])

  async function fetchCustomMedia() {
    setLoading(true)
    const { data, error } = await supabase
      .from('custom_media')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load custom media:', error.message)
    } else if (data) {
      setCustomMedia(data.map(rowToItem))
    }
    setLoading(false)
  }

  // Insert a new row; returns { success, error }
  async function addMedia(item) {
    const { data, error } = await supabase
      .from('custom_media')
      .insert({
        user_id:     user.id,
        title:       item.title,
        type:        item.type,
        genre:       item.genre,
        year:        item.year,
        description: item.description,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to add media:', error.message)
      return { success: false, error: error.message }
    }

    setCustomMedia((prev) => [rowToItem(data), ...prev])
    return { success: true }
  }

  // Update an existing row by id; returns { success, error }
  async function updateMedia(id, changes) {
    const { data, error } = await supabase
      .from('custom_media')
      .update({
        title:       changes.title,
        type:        changes.type,
        genre:       changes.genre,
        year:        changes.year,
        description: changes.description,
      })
      .eq('id', id)
      .eq('user_id', user.id) // safety: never touch another user's row
      .select()
      .single()

    if (error) {
      console.error('Failed to update media:', error.message)
      return { success: false, error: error.message }
    }

    setCustomMedia((prev) =>
      prev.map((item) => (item.id === id ? rowToItem(data) : item))
    )
    return { success: true }
  }

  // Delete a row by id; returns { success, error }
  async function deleteMedia(id) {
    const { error } = await supabase
      .from('custom_media')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to delete media:', error.message)
      return { success: false, error: error.message }
    }

    setCustomMedia((prev) => prev.filter((item) => item.id !== id))
    return { success: true }
  }

  return { customMedia, loading, addMedia, updateMedia, deleteMedia }
}

// Maps a Supabase row to the shape the rest of the app expects
function rowToItem(row) {
  return {
    id:          row.id,
    title:       row.title,
    type:        row.type,
    genre:       row.genre,
    year:        row.year,
    description: row.description,
  }
}

export default useCustomMedia
