import React from 'react'
import MediaCard from './MediaCard.jsx'

// Displays the user's saved favorites
// Props:
//   favorites      — array of saved item objects
//   toggleFavorite — function to remove an item from favorites
function Favorites({ favorites, toggleFavorite }) {
  return (
    <section className="favorites-section">
      <h2 className="section-title">Favorites</h2>

      {favorites.length === 0 ? (
        // Empty state: shown when no items have been saved yet
        <p className="empty-state">No favorites yet. Click "Add to Favorites" on any item.</p>
      ) : (
        <div className="media-grid">
          {favorites.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              isFavorite={true}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default Favorites
