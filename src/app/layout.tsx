import './globals.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import RootPage from './page'

const root = document.getElementById('root')

if (root !== null) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <div className="w-[64rem] max-w-full bg-100 text-700 base16-monokai">
        <RootPage />
      </div>
    </React.StrictMode>
  )
}
