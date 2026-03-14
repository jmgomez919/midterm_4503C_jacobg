import React, { useRef, useState } from 'react'

function ImageUploader({ mediaId, itemImages = [], onUpload, onDelete, maxImages = 5 }) {
  const inputRef    = useRef(null)
  const [pending, setPending]     = useState([])  // in-flight previews
  const [uploadError, setUploadError] = useState('')

  const totalShown = itemImages.length + pending.length
  const canAdd     = totalShown < maxImages

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    e.target.value = ''
    setUploadError('')

    const slots    = maxImages - totalShown
    const toUpload = files.slice(0, slots)

    // Show local previews immediately — thumbnails appear before Supabase responds
    const previews = toUpload.map(file => ({
      uid:       `${Date.now()}_${Math.random()}`,
      objectUrl: URL.createObjectURL(file),
    }))
    setPending(prev => [...prev, ...previews])

    // Upload to Supabase and check the result
    const result = await onUpload(mediaId, toUpload)

    // Always revoke object URLs and remove the pending placeholders
    previews.forEach(p => URL.revokeObjectURL(p.objectUrl))
    setPending(prev => prev.filter(p => !previews.some(pp => pp.uid === p.uid)))

    // Surface any error to the user so they know the upload did not save
    if (result?.success === false) {
      setUploadError(result.error || 'Upload failed. Please try again.')
    } else if (result?.partial) {
      setUploadError(`Some photos could not be saved: ${result.error}`)
    }
    // On full success, itemImages prop will update automatically via useMediaImages state
  }

  return (
    <div className="img-uploader">
      <div className="img-thumb-row">

        {/* Confirmed images saved in Supabase */}
        {itemImages.map(img => (
          <div key={img.id} className="img-thumb-wrap">
            <img src={img.url} alt="" className="img-thumb" />
            <button
              className="img-thumb-remove"
              onClick={() => onDelete(img.id, img.storagePath, mediaId)}
              title="Remove"
            >×</button>
          </div>
        ))}

        {/* In-flight previews with uploading indicator */}
        {pending.map(p => (
          <div key={p.uid} className="img-thumb-wrap img-thumb-pending">
            <img src={p.objectUrl} alt="" className="img-thumb" />
            <div className="img-thumb-overlay">↑</div>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            className="img-add-btn"
            onClick={() => inputRef.current?.click()}
            title={`Add up to ${maxImages - totalShown} more photo${maxImages - totalShown === 1 ? '' : 's'}`}
          >
            +
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFiles}
            />
          </button>
        )}

      </div>

      <p className="img-uploader-count">
        {itemImages.length} / {maxImages} photos
        {pending.length > 0 && <span className="img-uploading-label"> — uploading…</span>}
      </p>

      {/* Visible error message when Supabase upload fails */}
      {uploadError && (
        <p className="img-upload-error">{uploadError}</p>
      )}
    </div>
  )
}

export default ImageUploader
