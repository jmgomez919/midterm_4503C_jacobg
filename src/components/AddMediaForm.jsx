import React, { useState } from 'react'

const EMPTY_FORM = {
  title: '',
  type: 'movie',
  genre: '',
  year: '',
  description: '',
}

// AddMediaForm lets users add their own entries to the media library.
// Props:
//   onAdd — async callback; returns { success, error }
function AddMediaForm({ onAdd }) {
  const [fields, setFields]       = useState(EMPTY_FORM)
  const [error, setError]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successTitle, setSuccessTitle] = useState('') // name of last added item

  function handleChange(e) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessTitle('')

    const allFilled = Object.values(fields).every((v) => v.toString().trim() !== '')
    if (!allFilled) {
      setError('Please fill in all fields before submitting.')
      return
    }

    setSubmitting(true)

    const result = await onAdd({
      id:          Date.now(), // discarded by useCustomMedia; Supabase UUID is used instead
      title:       fields.title.trim(),
      type:        fields.type,
      genre:       fields.genre.trim(),
      year:        Number(fields.year),
      description: fields.description.trim(),
    })

    setSubmitting(false)

    if (result?.success) {
      setSuccessTitle(fields.title.trim()) // show confirmation before resetting
      setFields(EMPTY_FORM)
    } else {
      // Show the Supabase error message so the user knows what went wrong
      setError(result?.error || 'Something went wrong. Please try again.')
    }
  }

  return (
    <section className="add-media-section">
      <h2 className="section-title">Add New Media</h2>

      <form className="add-media-form" onSubmit={handleSubmit} noValidate>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Blade Runner"
              value={fields.title}
              onChange={handleChange}
            />
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
            <input
              id="genre"
              name="genre"
              type="text"
              placeholder="e.g. Sci-Fi"
              value={fields.genre}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="year">Year</label>
            <input
              id="year"
              name="year"
              type="number"
              placeholder="e.g. 1982"
              min="1800"
              max="2100"
              value={fields.year}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="A brief description..."
            value={fields.description}
            onChange={handleChange}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        {/* Success confirmation — shows the title of the item just added */}
        {successTitle && (
          <p className="form-success">
            "{successTitle}" was added to your library.
          </p>
        )}

        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Add Media'}
        </button>

      </form>
    </section>
  )
}

export default AddMediaForm
