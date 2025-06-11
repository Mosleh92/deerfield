import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  FileText, 
  Mail 
} from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from '../ui/Button'

const iconMap = {
  LayoutDashboard,
  Store,
  Users,
  FileText,
  Mail
}

export default function OperationsHeader({ activeTab, setActiveTab, tabs }) {
  const { t } = useTranslation()
  const { isRTL } = useLanguage()

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('operations_management')}
        </h1>
        <p className="text-gray-600 mt-1">
          إدارة شاملة لجميع عمليات المول
        </p>
      </div>

      <div className={cn(
        'flex space-x-1 overflow-x-auto',
        isRTL && 'space-x-reverse'
      )}>
        {tabs.map((tab) => {
          const Icon = iconMap[tab.icon]
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                isRTL && 'flex-row-reverse'
              )}
            >
              {Icon && <Icon className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />}
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}