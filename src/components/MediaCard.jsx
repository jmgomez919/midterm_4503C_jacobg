import React, { useState } from 'react'

// MediaCard renders a single media item in either view or edit mode.
// Props:
//   item           — media object
//   isFavorite     — boolean
//   toggleFavorite — fn to add/remove from favorites
//   onUpdate       — optional async fn(id, changes) => { success, error }
//   onDelete       — optional async fn(id) => { success, error }
//   When onUpdate/onDelete are undefined the Edit button is hidden (sample items).
function MediaCard({ item, isFavorite, toggleFavorite, onUpdate, onDelete }) {
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Local copy of fields used only while editing
  const [fields, setFields] = useState({
    title:       item.title,
    type:        item.type,
    genre:       item.genre,
    year:        item.year,
    description: item.description,
  })

  // Confirm delete state — avoids native browser confirm()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  function handleEdit() {
    // Reset fields to the current saved values before opening
    setFields({
      title:       item.title,
      type:        item.type,
      genre:       item.genre,
      year:        item.year,
      description: item.description,
    })
    setSaveError('')
    setConfirmDelete(false)
    setEditing(true)
  }

  function handleCancel() {
    setEditing(false)
    setSaveError('')
    setConfirmDelete(false)
  }

  async function handleSave() {
    const allFilled = Object.values(fields).every((v) => v.toString().trim() !== '')
    if (!allFilled) { setSaveError('All fields are required.'); return }

    setSaving(true)
    setSaveError('')
    const result = await onUpdate(item.id, { ...fields, year: Number(fields.year) })
    setSaving(false)

    if (result?.success) {
      setEditing(false)
    } else {
      setSaveError(result?.error || 'Save failed. Please try again.')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await onDelete(item.id)
    if (!result?.success) {
      setDeleting(false)
      setSaveError(result?.error || 'Delete failed. Please try again.')
      setConfirmDelete(false)
    }
    // On success the item disappears from state — no further state update needed
  }

  // ── Edit mode ──────────────────────────────────────────────
  if (editing) {
    return (
      <div className="media-card card-editing">

        <div className="edit-row">
          <div className="edit-group">
            <label>Title</label>
            <input name="title" value={fields.title} onChange={handleChange} />
          </div>
          <div className="edit-group">
            <label>Type</label>
            <select name="type" value={fields.type} onChange={handleChange}>
              <option value="movie">Movie</option>
              <option value="book">Book</option>
            </select>
          </div>
        </div>

        <div className="edit-row">
          <div className="edit-group">
            <label>Genre</label>
            <input name="genre" value={fields.genre} onChange={handleChange} />
          </div>
          <div className="edit-group">
            <label>Year</label>
            <input name="year" type="number" min="1800" max="2100" value={fields.year} onChange={handleChange} />
          </div>
        </div>

        <div className="edit-group">
          <label>Description</label>
          <textarea name="description" rows={3} value={fields.description} onChange={handleChange} />
        </div>

        {saveError && <p className="edit-error">{saveError}</p>}

        {/* ── Action buttons ── */}
        <div className="edit-actions">
          <button className="btn-save"   onClick={handleSave}   disabled={saving || deleting}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="btn-cancel" onClick={handleCancel} disabled={saving || deleting}>
            Cancel
          </button>

          {/* Delete: first click shows confirmation, second click confirms */}
          {!confirmDelete ? (
            <button className="btn-delete" onClick={() => setConfirmDelete(true)} disabled={saving || deleting}>
              Delete
            </button>
          ) : (
            <span className="delete-confirm">
              Sure?&nbsp;
              <button className="btn-delete-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button className="btn-cancel" onClick={() => setConfirmDelete(false)}>
                No
              </button>
            </span>
          )}
        </div>

      </div>
    )
  }

  // ── View mode ──────────────────────────────────────────────
  return (
    <div className={`media-card ${isFavorite ? 'card-favorited' : ''}`}>

      <div className="card-meta">
        <span className={`card-badge badge-${item.type}`}>{item.type}</span>
        <span className="card-year">{item.year}</span>
      </div>

      <h2 className="card-title">{item.title}</h2>
      <p className="card-genre">{item.genre}</p>
      <p className="card-description">{item.description}</p>

      <button
        className={`btn-favorite ${isFavorite ? 'btn-favorited' : ''}`}
        onClick={() => toggleFavorite(item)}
      >
        {isFavorite ? '★ Remove from Favorites' : '☆ Add to Favorites'}
      </button>

      {/* Edit button — only rendered when onUpdate is provided (custom items only) */}
      {onUpdate && (
        <button className="btn-edit" onClick={handleEdit}>
          Edit
        </button>
      )}

    </div>
  )
}

export default MediaCard
