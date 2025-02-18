import '@/app/globals.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import RootPage from '@/app/page'

const root = document.getElementById('root')

if (root !== null) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <div className="w-[64rem] max-w-full bg-100 text-700 base16-selenized-black">
        <RootPage />
      </div>
    </React.StrictMode>
  )
}
