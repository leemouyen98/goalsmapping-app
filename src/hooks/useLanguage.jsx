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
   * t('section.key', { var: value }) — returns the string for the current language.
   * Supports dot-path into the translations tree, e.g. t('nav.dashboard').
   * Optional second argument replaces {placeholder} tokens in the string.
   * e.g. t('retirement.fundsRunOutMsg', { age: 75, pct: 80 })
   * Falls back to English then to the key path if not found.
   */
  const t = useCallback((path, vars = null) => {
    const parts = path.split('.')
    let node = translations
    for (const part of parts) {
      if (node == null) break
      node = node[part]
    }
    let str = path
    if (node && typeof node === 'object' && node[lang] !== undefined) {
      str = node[lang]
    } else if (node && typeof node === 'object' && node.en !== undefined) {
      str = node.en
    }
    // Replace {placeholder} tokens with provided vars
    if (vars && typeof str === 'string') {
      str = str.replace(/\{(\w+)\}/g, (_, key) => (vars[key] !== undefined ? vars[key] : `{${key}}`))
    }
    return str
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
