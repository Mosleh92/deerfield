import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import MainLayout from '../../components/layout/MainLayout'
import OperationsHeader from '../../components/operations/OperationsHeader'
import ShopManagement from '../../components/operations/ShopManagement'
import UserManagement from '../../components/operations/UserManagement'
import PermitManagement from '../../components/operations/PermitManagement'
import MemoSystem from '../../components/operations/MemoSystem'
import OperationsDashboard from '../../components/operations/OperationsDashboard'
import { USER_ROLES } from '../../lib/constants'

export default function OperationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!loading && (!user || !['admin', 'operations'].includes(user.role))) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || !['admin', 'operations'].includes(user.role)) {
    return null
  }

  const tabs = [
    { id: 'overview', label: t('dashboard'), icon: 'LayoutDashboard' },
    { id: 'shops', label: t('shop_management'), icon: 'Store' },
    { id: 'users', label: t('user_management'), icon: 'Users' },
    { id: 'permits', label: t('permit_management'), icon: 'FileText' },
    { id: 'memos', label: t('memo_system'), icon: 'Mail' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OperationsDashboard />
      case 'shops':
        return <ShopManagement />
      case 'users':
        return <UserManagement />
      case 'permits':
        return <PermitManagement />
      case 'memos':
        return <MemoSystem />
      default:
        return <OperationsDashboard />
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <OperationsHeader 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          tabs={tabs} 
        />
        
        <div className="bg-white rounded-lg shadow">
          {renderContent()}
        </div>
      </div>
    </MainLayout>
  )
}