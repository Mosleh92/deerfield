import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/router'
import MainLayout from '../../components/layout/MainLayout'
import SecurityDashboard from '../../components/departments/security/SecurityDashboard'
import { Shield, Eye, UserCheck, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default function SecurityDashboardPage() {
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

      if (user?.role !== 'security') {
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

  if (loading || loadingData) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (!isAuthenticated || user?.role !== 'security') {
    return null
  }

  // Calculate security stats
  const pendingSecurity = permits.filter(p => 
    p.approvals?.technical?.status === 'approved' && 
    !p.approvals?.security?.status
  )
  
  const approvedBySecurity = permits.filter(p => 
    p.approvals?.security?.status === 'approved'
  )
  
  const activePermits = permits.filter(p => 
    p.status === 'approved' && 
    new Date(p.startDate) <= new Date() && 
    new Date(p.endDate) >= new Date()
  )

  const todaysWork = permits.filter(p => {
    const today = new Date().toISOString().split('T')[0]
    return p.startDate === today && p.status === 'approved'
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
                    <Shield className="h-8 w-8 text-blue-600" />
                    لوحة تحكم قسم الأمن
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    مراقبة ومراجعة التصاريح الأمنية
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={loadPermits}
                    className="btn-outline flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    مراقبة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Pending Security Review */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">يتطلب مراجعة أمنية</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {pendingSecurity.length}
                    </p>
                    <p className="mr-2 text-sm text-orange-600">معلق</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved by Security */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">معتمد أمنياً</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {approvedBySecurity.length}
                    </p>
                    <p className="mr-2 text-sm text-green-600">موافق</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Work Today */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">أعمال اليوم</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {todaysWork.length}
                    </p>
                    <p className="mr-2 text-sm text-blue-600">نشط</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Alerts */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">تنبيهات هامة</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                    <p className="mr-2 text-sm text-green-600">لا توجد</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Dashboard Component */}
          <SecurityDashboard 
            permits={permits}
            onRefresh={loadPermits}
          />
        </div>
      </div>
    </MainLayout>
  )
}