import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/router'
import MainLayout from '../../components/layout/MainLayout'
import TenantDashboard from '../../components/departments/tenant/TenantDashboard'
import { Store, FileText, Plus, Bell, CheckCircle, Clock } from 'lucide-react'

export default function TenantDashboardPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [permits, setPermits] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      if (user?.role !== 'tenant') {
        router.push('/unauthorized')
        return
      }

      loadPermits()
    }
  }, [user, isAuthenticated, loading, router])

  const loadPermits = async () => {
    try {
      const response = await fetch('/api/permits')
      if (response.ok) {
        const data = await response.json()
        setPermits(data.permits || [])
      }
    } catch (error) {
      console.error('Error loading permits:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleNewPermit = () => {
    router.push('/permits/new')
  }

  if (loading || loadingData) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (!isAuthenticated || user?.role !== 'tenant') {
    return null
  }

  // Calculate tenant stats
  const totalPermits = permits.length
  const pendingPermits = permits.filter(p => p.status === 'pending').length
  const approvedPermits = permits.filter(p => p.status === 'approved').length
  const activePermits = permits.filter(p => {
    const today = new Date()
    const startDate = new Date(p.startDate)
    const endDate = new Date(p.endDate)
    return p.status === 'approved' && startDate <= today && endDate >= today
  }).length

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Store className="h-8 w-8 text-blue-600" />
                    {user.shopName || 'لوحة تحكم المتجر'}
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    إدارة تصاريح العمل والخدمات
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleNewPermit}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    طلب تصريح جديد
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Permits */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">إجمالي التصاريح</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {totalPermits}
                    </p>
                    <p className="mr-2 text-sm text-blue-600">تصريح</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Permits */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">قيد المراجعة</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {pendingPermits}
                    </p>
                    <p className="mr-2 text-sm text-orange-600">معلق</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved Permits */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">معتمد</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {approvedPermits}
                    </p>
                    <p className="mr-2 text-sm text-green-600">موافق</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Work */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">أعمال نشطة</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {activePermits}
                    </p>
                    <p className="mr-2 text-sm text-purple-600">جاري</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Dashboard Component */}
          <TenantDashboard 
            permits={permits}
            onRefresh={loadPermits}
          />
        </div>
      </div>
    </MainLayout>
  )
}
  const loadPermits = async () => {
    try {
      const response = await fetch('/api/permits')
      if (response.ok) {
        const data = await response.json()
        setPermits(data.permits || [])
      }
    } catch (error) {
      console.error('Error loading permits:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (!isAuthenticated || user?.role !== 'tenant') {
    return null
  }

  // Calculate tenant stats
  const myPermits = permits.filter(p => p.shopId === user.shopId)
  const pendingPermits = myPermits.filter(p => p.status === 'pending')
  const approvedPermits = myPermits.filter(p => p.status === 'approved')
  const activePermits = myPermits.filter(p => {
    const today = new Date().toISOString().split('T')[0]
    return p.status === 'approved' && 
           p.startDate <= today && 
           p.endDate >= today
  })

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Store className="h-8 w-8 text-blue-600" />
                    لوحة تحكم المتجر
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    {user.shopName} - إدارة تصاريح العمل
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/permits/new')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    طلب تصريح جديد
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Permits */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">إجمالي التصاريح</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {myPermits.length}
                    </p>
                    <p className="mr-2 text-sm text-blue-600">تصريح</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Permits */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">قيد المراجعة</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {pendingPermits.length}
                    </p>
                    <p className="mr-2 text-sm text-orange-600">معلق</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved Permits */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">معتمد</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {approvedPermits.length}
                    </p>
                    <p className="mr-2 text-sm text-green-600">موافق</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Today */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">نشط اليوم</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {activePermits.length}
                    </p>
                    <p className="mr-2 text-sm text-purple-600">جاري العمل</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Dashboard Component */}
          <TenantDashboard 
            permits={myPermits}
            onRefresh={loadPermits}
          />
        </div>
      </div>
    </MainLayout>
  )
