import React, { useState } from 'react'
import MediaCard from './MediaCard.jsx'
import MediaTableRow from './MediaTableRow.jsx'

// MediaList renders items in either a grid or table view.
// Props:
//   title          — section heading (rendered by parent CollapsibleSection)
//   items          — array of media objects
//   favorites      — array of saved items
//   toggleFavorite — fn passed to each card/row
//   onUpdate       — optional: enables Edit in editable lists
//   onDelete       — optional: enables Delete in editable lists
//   showViewToggle — show grid/table toggle buttons (Library section only)
function MediaList({ title, items, favorites, toggleFavorite, onUpdate, onDelete, showViewToggle = false }) {
  const [view, setView] = useState('grid') // 'grid' | 'table'

  const itemCount = `${items.length} ${items.length === 1 ? 'item' : 'items'}`

  return (
    <div className="media-list-inner">

      {/* Header row: item count + optional view toggle */}
      <div className="list-controls">
        <p className="list-summary">{itemCount}</p>

        {showViewToggle && (
          <div className="view-toggle">
            <button
              className={`btn-view ${view === 'grid' ? 'btn-view-active' : ''}`}
              onClick={() => setView('grid')}
              title="Grid view"
            >
              ⊞ Grid
            </button>
            <button
              className={`btn-view ${view === 'table' ? 'btn-view-active' : ''}`}
              onClick={() => setView('table')}
              title="Table view"
            >
              ☰ Table
            </button>
          </div>
        )}
      </div>

      {/* ── Grid view ── */}
      {view === 'grid' && (
        <div className="media-grid">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              isFavorite={favorites.some((f) => String(f.id) === String(item.id))}
              toggleFavorite={toggleFavorite}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* ── Table view ── */}
      {view === 'table' && (
        <div className="table-wrapper">
          <table className="media-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Genre</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <MediaTableRow
                  key={item.id}
                  item={item}
                  isFavorite={favorites.some((f) => String(f.id) === String(item.id))}
                  toggleFavorite={toggleFavorite}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
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
