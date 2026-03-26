import { createContext, useContext, useState, useCallback } from 'react'
import translations from '../lib/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('sora_lang') || 'en'
  )

  const toggle = (next) => {
    const value = next || (lang === 'en' ? 'zh' : 'en')
    localStorage.setItem('sora_lang', value)
    setLang(value)
  }

  /**
   * t('section.key') — returns the string for the current language.
   * Supports dot-path into the translations tree, e.g. t('nav.dashboard').
   * Falls back to the key itself if not found.
   */
  const t = useCallback((path) => {
    const parts = path.split('.')
    let node = translations
    for (const part of parts) {
      if (node == null) break
      node = node[part]
    }
    if (node && typeof node === 'object' && node[lang] !== undefined) {
      return node[lang]
    }
    // fallback: return English or path
    if (node && typeof node === 'object' && node.en !== undefined) {
      return node.en
    }
    return path
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
