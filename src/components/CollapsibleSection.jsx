import React, { useState } from 'react'

// CollapsibleSection wraps any content with a clickable header that toggles visibility.
// Props:
//   title       — section heading text
//   children    — content to show/hide
//   defaultOpen — whether the section starts expanded (default: true)
function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="collapsible-section">
      <button
        className="collapsible-header"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span className="section-title">{title}</span>
        <span className="collapsible-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && <div className="collapsible-body">{children}</div>}
    </section>
  )
}

export default CollapsibleSection
