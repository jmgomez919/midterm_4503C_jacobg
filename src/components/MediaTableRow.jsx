import React, { useState } from 'react'
import ImageUploader from './ImageUploader.jsx'

function MediaTableRow({
  item, isFavorite, toggleFavorite,
  onUpdate, onDelete,
  itemImages = [], onUpload, onDeleteImage,
}) {
  const [editing, setEditing]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [saveError, setSaveError]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [fields, setFields] = useState({
    title: item.title, type: item.type,
    genre: item.genre, year: item.year, description: item.description,
  })

  function handleChange(e) {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: value }))
  }

  function handleEdit() {
    setFields({ title: item.title, type: item.type, genre: item.genre, year: item.year, description: item.description })
    setSaveError(''); setConfirmDelete(false); setEditing(true)
  }

  function handleCancel() { setEditing(false); setSaveError(''); setConfirmDelete(false) }

  async function handleSave() {
    if (!Object.values(fields).every(v => v.toString().trim())) { setSaveError('All fields are required.'); return }
    setSaving(true)
    const result = await onUpdate(item.id, { ...fields, year: Number(fields.year) })
    setSaving(false)
    if (result?.success) setEditing(false)
    else setSaveError(result?.error || 'Save failed.')
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await onDelete(item.id)
    if (!result?.success) { setDeleting(false); setSaveError(result?.error || 'Delete failed.'); setConfirmDelete(false) }
  }

  // Resolve thumbnail: first uploaded image or static coverImage
  const thumbSrc = itemImages[0]?.url || item.coverImage

  // ── Edit mode: full-width expanded row ─────────────────────
  if (editing) {
    return (
      <tr className="table-row-editing">
        <td colSpan={6} className="table-edit-cell">
          <div className="table-edit-form">

            <div className="edit-section-label">Photos</div>
            <ImageUploader
              mediaId={item.id}
              itemImages={itemImages}
              onUpload={onUpload}
              onDelete={onDeleteImage}
            />

            <div className="edit-row">
              <div className="edit-group"><label>Title</label><input name="title" value={fields.title} onChange={handleChange} /></div>
              <div className="edit-group"><label>Type</label>
                <select name="type" value={fields.type} onChange={handleChange}>
                  <option value="movie">Movie</option>
                  <option value="book">Book</option>
                </select>
              </div>
              <div className="edit-group"><label>Genre</label><input name="genre" value={fields.genre} onChange={handleChange} /></div>
              <div className="edit-group"><label>Year</label><input name="year" type="number" min="1800" max="2100" value={fields.year} onChange={handleChange} /></div>
            </div>

            <div className="edit-group">
              <label>Description</label>
              <textarea name="description" rows={2} value={fields.description} onChange={handleChange} />
            </div>

            {saveError && <p className="edit-error">{saveError}</p>}

            <div className="edit-actions">
              <button className="btn-save"   onClick={handleSave}   disabled={saving || deleting}>{saving ? 'Saving…' : 'Save'}</button>
              <button className="btn-cancel" onClick={handleCancel} disabled={saving || deleting}>Cancel</button>
              {!confirmDelete
                ? <button className="btn-delete" onClick={() => setConfirmDelete(true)} disabled={saving || deleting}>Delete</button>
                : <span className="delete-confirm">
                    Sure?&nbsp;
                    <button className="btn-delete-confirm" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Yes, delete'}</button>
                    <button className="btn-cancel" onClick={() => setConfirmDelete(false)}>No</button>
                  </span>
              }
            </div>

          </div>
        </td>
      </tr>
    )
  }

  // ── View mode ───────────────────────────────────────────────
  return (
    <tr className={`table-row ${isFavorite ? 'table-row-favorited' : ''}`}>
      <td className="table-cell-thumb">
        {thumbSrc
          ? <img src={thumbSrc} alt="" className="table-thumb" onError={e => { e.target.style.display = 'none' }} />
          : <div className="table-thumb-empty" />
        }
      </td>
      <td className="table-cell-title">{item.title}</td>
      <td><span className={`card-badge badge-${item.type}`}>{item.type}</span></td>
      <td className="table-cell-genre">{item.genre}</td>
      <td className="table-cell-year">{item.year}</td>
      <td className="table-cell-actions">
        <button
          className={`btn-favorite btn-fav-sm ${isFavorite ? 'btn-favorited' : ''}`}
          onClick={() => toggleFavorite(item)}
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >{isFavorite ? '★' : '☆'}</button>
        {onUpdate && (
          <button className="btn-edit btn-edit-sm" onClick={handleEdit} title="Edit">Edit</button>
        )}
      </td>
    </tr>
  )
}

export default MediaTableRow
