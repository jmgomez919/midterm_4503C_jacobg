import React, { useState, useEffect } from 'react'

// ImageGallery displays up to 5 images in a carousel.
// Props:
//   uploadedImages — array of { id, url } from useMediaImages (user-uploaded)
//   coverImage     — static fallback URL (from mediaData or undefined)
function ImageGallery({ uploadedImages = [], coverImage }) {
  const [index, setIndex] = useState(0)

  // Build the display list: uploaded images first, then fall back to coverImage
  const all = uploadedImages.length > 0
    ? uploadedImages
    : coverImage ? [{ id: '__cover__', url: coverImage }] : []

  // Reset to first image whenever the image list changes
  useEffect(() => { setIndex(0) }, [uploadedImages.length])

  if (all.length === 0) {
    return (
      <div className="img-gallery img-gallery-empty">
        <span>No image</span>
      </div>
    )
  }

  const current  = all[Math.min(index, all.length - 1)]
  const hasMulti = all.length > 1

  return (
    <div className="img-gallery">
      <img
        src={current.url}
        alt=""
        className="img-cover"
        onError={e => { e.target.style.display = 'none' }}
      />

      {hasMulti && (
        <>
          <button
            className="img-arrow img-arrow-left"
            onClick={e => { e.stopPropagation(); setIndex(i => Math.max(0, i - 1)) }}
            disabled={index === 0}
          >‹</button>

          <button
            className="img-arrow img-arrow-right"
            onClick={e => { e.stopPropagation(); setIndex(i => Math.min(all.length - 1, i + 1)) }}
            disabled={index === all.length - 1}
          >›</button>

          <span className="img-counter">{index + 1} / {all.length}</span>
        </>
      )}
    </div>
  )
}

export default ImageGallery
