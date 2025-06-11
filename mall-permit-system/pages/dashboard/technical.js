import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/router'
import MainLayout from '../../components/layout/MainLayout'
import TechnicalDashboard from '../../components/departments/technical/TechnicalDashboard'
import { Wrench, FileCheck, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function TechnicalDashboardPage() {
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

      if (user?.role !== 'technical') {
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

  if (!isAuthenticated || user?.role !== 'technical') {
    return null
  }

  // Calculate stats
  const pendingTechnical = permits.filter(p => 
    p.status === 'pending' && !p.approvals?.technical?.status
  )
  
  const approvedByTechnical = permits.filter(p => 
    p.approvals?.technical?.status === 'approved'
  )
  
  const rejectedByTechnical = permits.filter(p => 
    p.approvals?.technical?.status === 'rejected'
  )

  const heavyWorkPermits = permits.filter(p => 
    p.workType === 'heavy_work'
  )

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
                    <Wrench className="h-8 w-8 text-blue-600" />
                    لوحة تحكم القسم الفني
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    مراجعة وموافقة التصاريح الفنية
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={loadPermits}
                    className="btn-outline flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    تحديث
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Pending Technical Review */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">يتطلب مراجعة فنية</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {pendingTechnical.length}
                    </p>
                    <p className="mr-2 text-sm text-orange-600">معلق</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved by Technical */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">معتمد فنياً</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {approvedByTechnical.length}
                    </p>
                    <p className="mr-2 text-sm text-green-600">موافق</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejected by Technical */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">مرفوض فنياً</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {rejectedByTechnical.length}
                    </p>
                    <p className="mr-2 text-sm text-red-600">مرفوض</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Heavy Work Permits */}
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-500">أعمال ثقيلة</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {heavyWorkPermits.length}
                    </p>
                    <p className="mr-2 text-sm text-yellow-600">يتطلب تأمين</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Dashboard Component */}
          <TechnicalDashboard 
            permits={permits}
            onRefresh={loadPermits}
          />
        </div>
      </div>
    </MainLayout>
  )
}