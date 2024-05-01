import React from 'react'
import ReactDOM from 'react-dom/client'
import RootPage from './app/page.tsx'
import './index.css'

const root = document.getElementById('root')

if (root !== null) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <RootPage />
    </React.StrictMode>
  )
}
