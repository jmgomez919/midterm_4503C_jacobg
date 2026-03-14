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
import useMediaImages from './hooks/useMediaImages.js'

function App() {
  const { user, loading: authLoading, authError, signUp, signIn, signOut } = useAuth()
  const { favorites, toggleFavorite }                         = useFavorites(user)
  const { customMedia, addMedia, updateMedia, deleteMedia }   = useCustomMedia(user)
  const { images, uploadImages, deleteImage }                 = useMediaImages(user)

  // Combines creating the media record and uploading any selected images.
  // Called by AddMediaForm's onAdd prop.
  async function handleAddMedia(item, imageFiles = []) {
    const result = await addMedia(item)
    if (result.success && imageFiles.length > 0) {
      await uploadImages(result.id, imageFiles)
    }
    return result
  }

  if (authLoading) return <div className="app-loading"><p>Loading...</p></div>
  if (!user)       return <AuthForm onSignIn={signIn} onSignUp={signUp} error={authError} />

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

        <CollapsibleSection title="Add New Media" defaultOpen={true}>
          <AddMediaForm onAdd={handleAddMedia} />
        </CollapsibleSection>

        <hr className="section-divider" />

        {customMedia.length > 0 && (
          <>
            <CollapsibleSection title="Your Additions" defaultOpen={true}>
              <MediaList
                items={customMedia}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onUpdate={updateMedia}
                onDelete={deleteMedia}
                images={images}
                onUpload={uploadImages}
                onDeleteImage={deleteImage}
              />
            </CollapsibleSection>
            <hr className="section-divider" />
          </>
        )}

        <CollapsibleSection title="Favorites" defaultOpen={true}>
          <Favorites favorites={favorites} toggleFavorite={toggleFavorite} />
        </CollapsibleSection>

        <hr className="section-divider" />

        <CollapsibleSection title="Library" defaultOpen={true}>
          <MediaList
            items={mediaData}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            images={images}
            onUpload={uploadImages}
            onDeleteImage={deleteImage}
            showViewToggle={true}
          />
        </CollapsibleSection>

      </main>

    </div>
  )
}

export default App
