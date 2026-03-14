import React, { useState, useRef } from 'react'

const EMPTY_FORM = { title: '', type: 'movie', genre: '', year: '', description: '' }
const MAX_IMAGES = 5

// AddMediaForm — creates a new media entry and optionally uploads photos.
// Props:
//   onAdd — async (item, imageFiles[]) => { success, error }
//           App chains addMedia + uploadImages internally.
function AddMediaForm({ onAdd }) {
  const [fields, setFields]           = useState(EMPTY_FORM)
  const [error, setError]             = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [successTitle, setSuccessTitle] = useState('')

  // Staged image files (not yet uploaded — previewed locally before submit)
  const [imageFiles, setImageFiles]     = useState([])   // File objects
  const [imagePreviews, setImagePreviews] = useState([]) // object URLs
  const fileInputRef = useRef(null)

  function handleChange(e) {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: value }))
  }

  function handleFileSelect(e) {
    const selected = Array.from(e.target.files)
    const allowed  = selected.slice(0, MAX_IMAGES - imageFiles.length)

    const previews = allowed.map(f => URL.createObjectURL(f))
    setImageFiles(prev => [...prev, ...allowed])
    setImagePreviews(prev => [...prev, ...previews])
    e.target.value = ''
  }

  function removePreview(index) {
    URL.revokeObjectURL(imagePreviews[index]) // free memory
    setImageFiles(prev   => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessTitle('')

    if (!Object.values(fields).every(v => v.toString().trim())) {
      setError('Please fill in all fields before submitting.')
      return
    }

    setSubmitting(true)

    const result = await onAdd(
      {
        id:          Date.now(), // placeholder; Supabase UUID replaces it
        title:       fields.title.trim(),
        type:        fields.type,
        genre:       fields.genre.trim(),
        year:        Number(fields.year),
        description: fields.description.trim(),
      },
      imageFiles
    )

    setSubmitting(false)

    if (result?.success) {
      setSuccessTitle(fields.title.trim())
      setFields(EMPTY_FORM)
      imagePreviews.forEach(URL.revokeObjectURL) // free object URLs
      setImageFiles([])
      setImagePreviews([])
    } else {
      setError(result?.error || 'Something went wrong. Please try again.')
    }
  }

  const canAddMore = imageFiles.length < MAX_IMAGES

  return (
    <section className="add-media-section">

      <form className="add-media-form" onSubmit={handleSubmit} noValidate>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" type="text" placeholder="e.g. Blade Runner" value={fields.title} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select id="type" name="type" value={fields.type} onChange={handleChange}>
              <option value="movie">Movie</option>
              <option value="book">Book</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="genre">Genre</label>
            <input id="genre" name="genre" type="text" placeholder="e.g. Sci-Fi" value={fields.genre} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="year">Year</label>
            <input id="year" name="year" type="number" placeholder="e.g. 1982" min="1800" max="2100" value={fields.year} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} placeholder="A brief description..." value={fields.description} onChange={handleChange} />
        </div>

        {/* ── Photo picker ── */}
        <div className="form-group">
          <label>Photos <span className="form-label-hint">(up to {MAX_IMAGES})</span></label>
          <div className="img-thumb-row">
            {imagePreviews.map((src, i) => (
              <div key={i} className="img-thumb-wrap">
                <img src={src} alt="" className="img-thumb" />
                <button type="button" className="img-thumb-remove" onClick={() => removePreview(i)}>×</button>
              </div>
            ))}
            {canAddMore && (
              <button type="button" className="img-add-btn" onClick={() => fileInputRef.current?.click()}>
                +
                <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileSelect} />
              </button>
            )}
          </div>
          {imageFiles.length > 0 && (
            <p className="img-uploader-count">{imageFiles.length} / {MAX_IMAGES} selected</p>
          )}
        </div>

        {error       && <p className="form-error">{error}</p>}
        {successTitle && <p className="form-success">"{successTitle}" was added to your library.</p>}

        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Add Media'}
        </button>

      </form>
    </section>
  )
}

export default AddMediaForm
