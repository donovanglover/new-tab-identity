import '@/app/globals.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import RootPage from '@/app/page'
import { t } from '@/lib/i18n'

document.documentElement.lang = browser.i18n.getUILanguage()
document.title = t('extensionName')

const root = document.getElementById('root')

if (root !== null) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <div className='w-[64rem] max-w-full'>
        <RootPage />
      </div>
    </React.StrictMode>,
  )
}
