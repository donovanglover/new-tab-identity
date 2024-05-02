import './globals.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import RootPage from './page.tsx'

const root = document.getElementById('root')

if (root !== null) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <div className="bg-100 text-700 base16-katy">
        <RootPage />
      </div>
    </React.StrictMode>
  )
}
