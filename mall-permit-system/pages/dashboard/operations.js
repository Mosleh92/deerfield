import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/router'
import MainLayout from '../../components/layout/MainLayout'
import OperationsDashboard from '../../components/operations/OperationsDashboard'
import { Clipboard, Building, Users, FileText, AlertCircle, TrendingUp } from 'lucide-react'

export default function OperationsDashboardPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      if (user?.role !== 'operations') {
        router.push('/unauthorized')
        return
      }

      loadDashboardData()
    }
  }, [user, isAuthenticated, loading, router])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/reports?type=dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
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

  if (!isAuthenticated || user?.role !== 'operations') {
    return null
  }

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
                    <Clipboard className="h-8 w-8 text-blue-600" />
                    لوحة تحكم العمليات
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    إدارة العمليات اليومية وتصاريح العمل
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    آخر تحديث: {new Date().toLocaleString('ar-SA')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {dashboardData && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Pending Approvals */}
              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="mr-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-500">الموافقات المعلقة</h3>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboardData.pendingApprovals?.length || 0}
                      </p>
                      <p className="mr-2 text-sm text-orange-600">يتطلب اجراء</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Permits */}
              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mr-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-500">التصاريح النشطة</h3>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboardData.permitStats?.approved || 0}
                      </p>
                      <p className="mr-2 text-sm text-green-600">معتمد</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Shops */}
              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mr-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-500">المتاجر النشطة</h3>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboardData.shopStats?.active || 0}
                      </p>
                      <p className="mr-2 text-sm text-blue-600">متجر</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mr-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-500">الطلبات الأسبوعية</h3>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboardData.recentPermits?.length || 0}
                      </p>
                      <p className="mr-2 text-sm text-purple-600">طلب جديد</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Operations Dashboard */}
            <OperationsDashboard 
              dashboardData={dashboardData}
              onRefresh={loadDashboardData}
            />
          </div>
        )}
      </div>
    </MainLayout>
  )
}