/**
 * @file Application entry point.
 *
 * Mounts the React tree and opens the Dexie database up front so the
 * first render is not the thing that triggers schema creation.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/Glass.css'
import './styles/MenuAnimations.css'
import './styles/GlassComponents.css'
import App from '@/App.jsx'
import { db } from '@/db/db.js'

db.open().catch((err) => {
  console.error("Failed to open database:", err)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
