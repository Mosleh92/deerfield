import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { useTranslation } from 'react-i18next'
import { 
  Menu, 
  Bell, 
  Globe, 
  User, 
  LogOut, 
  Building,
  ChevronDown
} from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from '../ui/Button'
import NotificationDropdown from '../notifications/NotificationDropdown'

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { toggleLanguage, currentLanguage, isRTL } = useLanguage()
  const { unreadCount } = useNotifications()
  const { t } = useTranslation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Menu */}
          <div className={cn(
            'flex items-center space-x-4',
            isRTL && 'space-x-reverse'
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg">
                <Building className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {currentLanguage === 'ar' ? 'نظام تصاريح المول' : 'Mall Permit System'}
                </h1>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className={cn(
            'flex items-center space-x-4',
            isRTL && 'space-x-reverse'
          )}>
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-2"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentLanguage === 'ar' ? 'EN' : 'عربي'}
              </span>
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              
              <NotificationDropdown 
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name || user?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t(user?.role)}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className={cn(
                  'absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50',
                  isRTL ? 'left-0' : 'right-0'
                )}>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || user?.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      logout()
                      setShowUserMenu(false)
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2',
                      isRTL && 'text-right space-x-reverse'
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}