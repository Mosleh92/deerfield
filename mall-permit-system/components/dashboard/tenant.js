import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import MainLayout from '../../components/layout/MainLayout'
import TenantDashboard from '../../components/departments/tenant/TenantDashboard'
import MyPermits from '../../components/departments/tenant/MyPermits'
import NewPermitRequest from '../../components/departments/tenant/NewPermitRequest'
import ShopProfile from '../../components/departments/tenant/ShopProfile'
import { USER_ROLES } from '../../lib/constants'

export default function TenantPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    if (!loading && (!user || user.role !== USER_ROLES.TENANT)) {
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

  if (!user || user.role !== USER_ROLES.TENANT) {
    return null
  }

  const tabs = [
    { id: 'dashboard', label: t('dashboard') },
    { id: 'permits', label: t('my_permits') },
    { id: 'new-permit', label: t('new_permit') },
    { id: 'profile', label: t('shop_profile') },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <TenantDashboard />
      case 'permits':
        return <MyPermits />
      case 'new-permit':
        return <NewPermitRequest />
      case 'profile':
        return <ShopProfile />
      default:
        return <TenantDashboard />
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              مرحباً، {user.shopName || user.name}
            </h1>
            <p className="text-gray-600 mt-1">
              لوحة تحكم المتجر - إدارة طلبات التصاريح
            </p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {renderContent()}
        </div>
      </div>
    </MainLayout>
  )
}