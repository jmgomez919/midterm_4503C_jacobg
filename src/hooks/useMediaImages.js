import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const BUCKET = 'media-images'

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
      .order('created_at', { ascending: true }) // order by insert time, not position

    if (error) { console.error('Failed to load images:', error.message); return }

    const grouped = {}
    for (const row of data) {
      if (!grouped[row.media_id]) grouped[row.media_id] = []
      grouped[row.media_id].push(rowToImage(row))
    }
    setImages(grouped)
  }

  // Uploads files and returns { success: true } or { success: false, error: string }
  // so the caller can surface failures to the user instead of silently swallowing them.
  async function uploadImages(mediaId, files) {
    const mediaIdStr = String(mediaId)
    const existing   = images[mediaIdStr] || []
    const slots      = 5 - existing.length
    if (slots <= 0) return { success: false, error: 'Maximum of 5 photos already reached.' }

    const toUpload = Array.from(files).slice(0, slots)
    const added    = []
    let   lastError = null

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i]
      const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase()

      // Include a timestamp in the path so retries never collide in Storage
      const path = `${user.id}/${mediaIdStr}/${Date.now()}_${i}.${ext}`

      // upsert:true avoids "duplicate path" errors on retry
      const { error: storageErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true })

      if (storageErr) {
        console.error('Storage upload failed:', storageErr.message)
        lastError = `Storage error: ${storageErr.message}`
        continue
      }

      // position = number of images that existed + how many we've added so far
      const position = existing.length + added.length

      const { data: row, error: dbErr } = await supabase
        .from('media_images')
        .insert({ user_id: user.id, media_id: mediaIdStr, storage_path: path, position })
        .select()
        .single()

      if (dbErr) {
        console.error('Image record insert failed:', dbErr.message)
        lastError = `Database error: ${dbErr.message}`
        // Remove the orphaned file from Storage so it doesn't accumulate
        await supabase.storage.from(BUCKET).remove([path])
        continue
      }

      added.push(rowToImage(row))
    }

    if (added.length > 0) {
      setImages(prev => ({
        ...prev,
        [mediaIdStr]: [...(prev[mediaIdStr] || []), ...added],
      }))
    }

    if (added.length === 0) {
      return { success: false, error: lastError || 'Upload failed. Check that the Supabase storage bucket and media_images table exist.' }
    }

    // Partial success: some files uploaded, some failed
    if (added.length < toUpload.length) {
      return { success: true, partial: true, error: lastError }
    }

    return { success: true }
  }

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
