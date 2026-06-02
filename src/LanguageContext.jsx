import { createContext, useContext, useState } from 'react'
import { translations } from './translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'pt')

  const toggle = () => {
    const next = lang === 'pt' ? 'en' : 'pt'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  // Helper: replace {key} placeholders in a string
  const tr = (str, vars = {}) =>
    str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`))

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggle, tr }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
