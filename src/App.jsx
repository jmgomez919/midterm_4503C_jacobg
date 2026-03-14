import React from 'react'
import mediaData from './data/mediaData.js'
import MediaList from './components/MediaList.jsx'
import Favorites from './components/Favorites.jsx'
import AddMediaForm from './components/AddMediaForm.jsx'
import AuthForm from './components/AuthForm.jsx'
import CollapsibleSection from './components/CollapsibleSection.jsx'
import useAuth from './hooks/useAuth.js'
import useFavorites from './hooks/useFavorites.js'
import useCustomMedia from './hooks/useCustomMedia.js'

function App() {
  const { user, loading: authLoading, authError, signUp, signIn, signOut } = useAuth()
  const { favorites, toggleFavorite } = useFavorites(user)
  const { customMedia, addMedia, updateMedia, deleteMedia } = useCustomMedia(user)

  if (authLoading) {
    return <div className="app-loading"><p>Loading...</p></div>
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} error={authError} />
  }

  return (
    <div className="app">

      <header className="app-header">
        <div>
          <h1 className="app-title">MyLiterary</h1>
          <p className="app-subtitle">Track the movies and books on your list</p>
        </div>
        <div className="header-user">
          <span className="user-email">{user.email}</span>
          <button className="btn-signout" onClick={signOut}>Sign Out</button>
        </div>
      </header>

      <main className="app-content">

        {/* ── Add New Media ── collapsible, starts open */}
        <CollapsibleSection title="Add New Media" defaultOpen={true}>
          <AddMediaForm onAdd={addMedia} />
        </CollapsibleSection>

        <hr className="section-divider" />

        {/* ── Your Additions ── only shown when the user has added items */}
        {customMedia.length > 0 && (
          <>
            <CollapsibleSection title="Your Additions" defaultOpen={true}>
              <MediaList
                items={customMedia}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onUpdate={updateMedia}
                onDelete={deleteMedia}
              />
            </CollapsibleSection>
            <hr className="section-divider" />
          </>
        )}

        {/* ── Favorites ── collapsible */}
        <CollapsibleSection title="Favorites" defaultOpen={true}>
          <Favorites favorites={favorites} toggleFavorite={toggleFavorite} />
        </CollapsibleSection>

        <hr className="section-divider" />

        {/* ── Library ── collapsible with grid/table view toggle */}
        <CollapsibleSection title="Library" defaultOpen={true}>
          <MediaList
            items={mediaData}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            showViewToggle={true}
          />
        </CollapsibleSection>

      </main>

    </div>
  )
}

export default App
