import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const BUCKET = 'media-images'

// Fetches and manages all image records for the logged-in user.
// Images are stored in Supabase Storage; their paths are recorded in media_images.
// State shape: { [mediaId]: [{ id, url, storagePath, position }, ...] }
function useMediaImages(user) {
  const [images, setImages] = useState({})

  useEffect(() => {
    if (!user) { setImages({}); return }
    fetchAllImages()
  }, [user])

  async function fetchAllImages() {
    const { data, error } = await supabase
      .from('media_images')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) { console.error('Failed to load images:', error.message); return }

    // Group rows by media_id and resolve each storage_path to a public URL
    const grouped = {}
    for (const row of data) {
      if (!grouped[row.media_id]) grouped[row.media_id] = []
      grouped[row.media_id].push(rowToImage(row))
    }
    setImages(grouped)
  }

  // Uploads one or more files for a given media item.
  // Silently skips uploads that would exceed 5 images.
  async function uploadImages(mediaId, files) {
    const mediaIdStr = String(mediaId)
    const existing   = images[mediaIdStr] || []
    const slots      = 5 - existing.length
    if (slots <= 0) return

    const toUpload = Array.from(files).slice(0, slots)
    const added    = []

    for (let i = 0; i < toUpload.length; i++) {
      const file     = toUpload[i]
      const position = existing.length + i
      const ext      = file.name.split('.').pop().toLowerCase()
      const path     = `${user.id}/${mediaIdStr}/${position}_${Date.now()}.${ext}`

      const { error: storageErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false })

      if (storageErr) { console.error('Upload failed:', storageErr.message); continue }

      const { data: row, error: dbErr } = await supabase
        .from('media_images')
        .insert({ user_id: user.id, media_id: mediaIdStr, storage_path: path, position })
        .select()
        .single()

      if (dbErr) { console.error('Image record failed:', dbErr.message); continue }

      added.push(rowToImage(row))
    }

    if (added.length > 0) {
      setImages(prev => ({
        ...prev,
        [mediaIdStr]: [...(prev[mediaIdStr] || []), ...added],
      }))
    }
  }

  // Deletes an image from both Supabase Storage and the media_images table.
  async function deleteImage(imageId, storagePath, mediaId) {
    await supabase.storage.from(BUCKET).remove([storagePath])
    await supabase.from('media_images').delete().eq('id', imageId)

    const mediaIdStr = String(mediaId)
    setImages(prev => ({
      ...prev,
      [mediaIdStr]: (prev[mediaIdStr] || []).filter(img => img.id !== imageId),
    }))
  }

  return { images, uploadImages, deleteImage }
}

// Converts a media_images DB row to the shape used in state
function rowToImage(row) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(row.storage_path)
  return {
    id:          row.id,
    storagePath: row.storage_path,
    position:    row.position,
    url:         data.publicUrl,
  }
}

export default useMediaImages
