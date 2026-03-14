import React, { useState } from 'react'
import MediaCard from './MediaCard.jsx'
import MediaTableRow from './MediaTableRow.jsx'

function MediaList({
  items, favorites, toggleFavorite,
  onUpdate, onDelete,
  images, onUpload, onDeleteImage,
  showViewToggle = false,
}) {
  const [view, setView] = useState('grid')

  return (
    <div className="media-list-inner">

      <div className="list-controls">
        <p className="list-summary">{items.length} {items.length === 1 ? 'item' : 'items'}</p>

        {showViewToggle && (
          <div className="view-toggle">
            <button className={`btn-view ${view === 'grid'  ? 'btn-view-active' : ''}`} onClick={() => setView('grid')}>⊞ Grid</button>
            <button className={`btn-view ${view === 'table' ? 'btn-view-active' : ''}`} onClick={() => setView('table')}>☰ Table</button>
          </div>
        )}
      </div>

      {view === 'grid' && (
        <div className="media-grid">
          {items.map(item => (
            <MediaCard
              key={item.id}
              item={item}
              isFavorite={favorites.some(f => String(f.id) === String(item.id))}
              toggleFavorite={toggleFavorite}
              onUpdate={onUpdate}
              onDelete={onDelete}
              itemImages={images?.[String(item.id)] || []}
              onUpload={onUpload}
              onDeleteImage={onDeleteImage}
            />
          ))}
        </div>
      )}

      {view === 'table' && (
        <div className="table-wrapper">
          <table className="media-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Type</th>
                <th>Genre</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <MediaTableRow
                  key={item.id}
                  item={item}
                  isFavorite={favorites.some(f => String(f.id) === String(item.id))}
                  toggleFavorite={toggleFavorite}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  itemImages={images?.[String(item.id)] || []}
                  onUpload={onUpload}
                  onDeleteImage={onDeleteImage}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

export default MediaList
