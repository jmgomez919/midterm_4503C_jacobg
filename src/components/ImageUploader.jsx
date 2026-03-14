import React, { useRef } from 'react'

// ImageUploader shows thumbnails of existing uploaded images and an "Add" button.
// Used inside edit mode (MediaCard / MediaTableRow) where the media id is already known.
// Props:
//   mediaId       — id of the item these images belong to
//   itemImages    — array of { id, url, storagePath } for this item
//   onUpload      — async (mediaId, FileList) => void
//   onDelete      — async (imageId, storagePath, mediaId) => void
//   maxImages     — max allowed (default 5)
function ImageUploader({ mediaId, itemImages = [], onUpload, onDelete, maxImages = 5 }) {
  const inputRef  = useRef(null)
  const remaining = maxImages - itemImages.length
  const canAdd    = remaining > 0

  async function handleFiles(e) {
    if (e.target.files.length === 0) return
    await onUpload(mediaId, e.target.files)
    e.target.value = '' // allow re-selecting the same file
  }

  return (
    <div className="img-uploader">
      <div className="img-thumb-row">

        {/* Existing uploaded images */}
        {itemImages.map(img => (
          <div key={img.id} className="img-thumb-wrap">
            <img src={img.url} alt="" className="img-thumb" />
            <button
              className="img-thumb-remove"
              onClick={() => onDelete(img.id, img.storagePath, mediaId)}
              title="Remove image"
            >×</button>
          </div>
        ))}

        {/* Add button — hidden when limit reached */}
        {canAdd && (
          <button
            type="button"
            className="img-add-btn"
            onClick={() => inputRef.current?.click()}
            title={`Add up to ${remaining} more photo${remaining === 1 ? '' : 's'}`}
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
      <p className="img-uploader-count">{itemImages.length} / {maxImages} photos</p>
    </div>
  )
}

export default ImageUploader
