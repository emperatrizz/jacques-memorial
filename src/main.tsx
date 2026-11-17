import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LangProvider } from './i18n'
import { ContentProvider } from './content'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        <ContentProvider>
          <App />
        </ContentProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
