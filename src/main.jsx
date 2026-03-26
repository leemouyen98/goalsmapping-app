import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import { ContactsProvider } from './hooks/useContacts'
import { ToastProvider } from './hooks/useToast'
import { LanguageProvider } from './hooks/useLanguage'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ContactsProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ContactsProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)
