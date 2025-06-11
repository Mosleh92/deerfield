import { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageContext = createContext()

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState('ar')
  const [direction, setDirection] = useState('rtl')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'ar'
    changeLanguage(savedLanguage)
  }, [])

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang)
    const dir = lang === 'ar' ? 'rtl' : 'ltr'
    setDirection(dir)
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
    
    // Update document
    document.documentElement.dir = dir
    document.documentElement.lang = lang
    
    // Update body classes for styling
    document.body.className = document.body.className
      .replace(/\b(rtl|ltr)\b/g, '')
      .trim() + ` ${dir}`
  }

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'ar' ? 'en' : 'ar'
    changeLanguage(newLang)
  }

  const value = {
    currentLanguage,
    direction,
    changeLanguage,
    toggleLanguage,
    isRTL: direction === 'rtl',
    isArabic: currentLanguage === 'ar'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}