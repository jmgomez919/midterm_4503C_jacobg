import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const CLOUD_NAME     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const UPLOAD_URL     = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

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
      .order('created_at', { ascending: true })

    if (error) { console.error('Failed to load images:', error.message); return }

    const grouped = {}
    for (const row of data) {
      if (!grouped[row.media_id]) grouped[row.media_id] = []
      grouped[row.media_id].push(rowToImage(row))
    }
    setImages(grouped)
  }

  async function uploadToCloudinary(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', `media-tracker/${user.id}`)

    const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'Cloudinary upload failed')
    }
    const data = await res.json()
    return { publicId: data.public_id, url: data.secure_url }
  }

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

      let cloudinaryPublicId, cloudinaryUrl
      try {
        const result = await uploadToCloudinary(file)
        cloudinaryPublicId = result.publicId
        cloudinaryUrl      = result.url
      } catch (err) {
        console.error('Cloudinary upload failed:', err.message)
        lastError = err.message
        continue
      }

      const position = existing.length + added.length

      const { data: row, error: dbErr } = await supabase
        .from('media_images')
        .insert({
          user_id:      user.id,
          media_id:     mediaIdStr,
          storage_path: cloudinaryPublicId,
          position,
          cloudinary_url: cloudinaryUrl,
        })
        .select()
        .single()

      if (dbErr) {
        console.error('Image record insert failed:', dbErr.message)
        lastError = `Database error: ${dbErr.message}`
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
      return { success: false, error: lastError || 'Upload failed.' }
    }
    if (added.length < toUpload.length) {
      return { success: true, partial: true, error: lastError }
    }
    return { success: true }
  }

  async function deleteImage(imageId, storagePath, mediaId) {
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
  return {
    id:          row.id,
    storagePath: row.storage_path,
    position:    row.position,
    url:         row.cloudinary_url || row.storage_path,
  }
}

export default useMediaImages
