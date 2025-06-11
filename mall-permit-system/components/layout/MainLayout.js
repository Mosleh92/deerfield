import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import Header from './Header'
import Sidebar from './Sidebar'
import { cn } from '../../lib/utils'

export default function MainLayout({ children, showSidebar = true }) {
  const { user, loading } = useAuth()
  const { isRTL } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className={cn(
      'min-h-screen bg-gray-50',
      isRTL ? 'font-arabic' : 'font-english'
    )}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}
        
        <main className={cn(
          'flex-1 transition-all duration-300',
          showSidebar && 'lg:ml-64',
          isRTL && showSidebar && 'lg:ml-0 lg:mr-64'
        )}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}