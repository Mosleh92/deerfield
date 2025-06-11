import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTranslation } from 'react-i18next'
import { 
  LayoutDashboard,
  FileText,
  CheckCircle,
  Search,
  BarChart3,
  Mail,
  Settings,
  Users,
  Store,
  X
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { USER_ROLES, PERMISSIONS } from '../../lib/constants'
import Button from '../ui/Button'

export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const { isRTL } = useLanguage()
  const { t } = useTranslation()

  const navigation = [
    {
      name: t('dashboard'),
      href: `/dashboard/${user?.role}`,
      icon: LayoutDashboard,
      roles: [USER_ROLES.ADMIN, USER_ROLES.OPERATIONS, USER_ROLES.TECHNICAL, USER_ROLES.SECURITY, USER_ROLES.TENANT]
    },
    {
      name: t('permits'),
      href: '/permits',
      icon: FileText,
      roles: [USER_ROLES.ADMIN, USER_ROLES.OPERATIONS, USER_ROLES.TECHNICAL, USER_ROLES.SECURITY, USER_ROLES.TENANT]
    },
    {
      name: t('approvals'),
      href: '/approvals',
      icon: CheckCircle,
      roles: [USER_ROLES.ADMIN, USER_ROLES.OPERATIONS, USER_ROLES.TECHNICAL, USER_ROLES.SECURITY]
    },
    {
      name: t('inspections'),
      href: '/inspections',
      icon: Search,
      roles: [USER_ROLES.ADMIN, USER_ROLES.SECURITY, USER_ROLES.TECHNICAL]
    },
    {
      name: t('reports'),
      href: '/reports',
      icon: BarChart3,
      roles: [USER_ROLES.ADMIN, USER_ROLES.OPERATIONS]
    },
    {
      name: t('memos'),
      href: '/memos',
      icon: Mail,
      roles: [USER_ROLES.ADMIN, USER_ROLES.OPERATIONS, USER_ROLES.TECHNICAL, USER_ROLES.SECURITY, USER_ROLES.TENANT]
    },
    {
      name: t('shop_management'),
      href: '/management/shops',
      icon: Store,
      roles: [USER_ROLES.ADMIN, USER_ROLES.OPERATIONS],
      permission: PERMISSIONS.MANAGE_SHOPS
    },
    {
      name: t('user_management'),
      href: '/management/users',
      icon: Users,
      roles: [USER_ROLES.ADMIN, USER_ROLES.OPERATIONS],
      permission: PERMISSIONS.MANAGE_USERS
    },
    {
      name: t('settings'),
      href: '/settings',
      icon: Settings,
      roles: [USER_ROLES.ADMIN, USER_ROLES.OPERATIONS]
    }
  ]

  const filteredNavigation = navigation.filter(item => {
    if (!item.roles.includes(user?.role)) return false
    if (item.permission && !hasPermission(item.permission)) return false
    return true
  })

  const handleNavigation = (href) => {
    router.push(href)
    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        isRTL && 'right-0 border-l border-r-0',
        isRTL && (isOpen ? 'translate-x-0' : 'translate-x-full'),
        isRTL && 'lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('navigation')}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = router.pathname === item.href || router.pathname.startsWith(item.href)
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <item.icon className={cn(
                    'h-5 w-5',
                    isRTL ? 'ml-3' : 'mr-3'
                  )} />
                  {item.name}
                </button>
              )
            })}
          </nav>

          {/* User info at bottom */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
                <Users className="h-4 w-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || user?.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {t(user?.role)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}