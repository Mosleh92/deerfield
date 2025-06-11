import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useData } from '../../contexts/DataContext'
import { 
  Store, 
  FileText, 
  Clock, 
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatDate, getRelativeTime } from '../../lib/utils'

export default function OperationsDashboard() {
  const { t } = useTranslation()
  const { shops, permits } = useData()
  const [stats, setStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    calculateStats()
    loadRecentActivity()
  }, [shops, permits])

  const calculateStats = () => {
    const activeShops = shops.filter(s => s.status === 'active').length
    const totalPermits = permits.length
    const pendingPermits = permits.filter(p => p.status === 'pending').length
    const approvedToday = permits.filter(p => 
      p.status === 'approved' && 
      new Date(p.updatedAt).toDateString() === new Date().toDateString()
    ).length

    setStats({
      totalShops: shops.length,
      activeShops,
      totalPermits,
      pendingPermits,
      approvedToday,
      completionRate: totalPermits ? Math.round((permits.filter(p => p.status === 'completed').length / totalPermits) * 100) : 0
    })
  }

  const loadRecentActivity = () => {
    const activities = []
    
    // Add recent permits
    permits
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .forEach(permit => {
        activities.push({
          id: permit.id,
          type: 'permit_created',
          message: `تم إنشاء تصريح جديد: ${permit.id}`,
          details: `${permit.shopName} - ${permit.workDescription.substring(0, 50)}...`,
          timestamp: permit.createdAt,
          status: permit.status
        })
      })

    // Add recent shops
    shops
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .forEach(shop => {
        activities.push({
          id: shop.id,
          type: 'shop_created',
          message: `تم إنشاء حساب متجر جديد: ${shop.shopName}`,
          details: `رقم المتجر: ${shop.shopNumber} - ${shop.category}`,
          timestamp: shop.createdAt,
          status: shop.status
        })
      })

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    setRecentActivity(activities.slice(0, 15))
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  )

  const ActivityItem = ({ activity }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'permit_created':
          return <FileText className="h-4 w-4" />
        case 'shop_created':
          return <Store className="h-4 w-4" />
        default:
          return <Activity className="h-4 w-4" />
      }
    }

    const getStatusColor = () => {
      switch (activity.status) {
        case 'active':
        case 'approved':
          return 'success'
        case 'pending':
          return 'warning'
        case 'rejected':
          return 'error'
        default:
          return 'default'
      }
    }

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {activity.message}
            </p>
            <Badge variant={getStatusColor()}>
              {activity.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {activity.details}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getRelativeTime(activity.timestamp)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي المتاجر"
          value={stats.totalShops}
          icon={Store}
          color="bg-blue-500"
          subtitle={`${stats.activeShops} متجر نشط`}
        />
        
        <StatCard
          title="إجمالي التصاريح"
          value={stats.totalPermits}
          icon={FileText}
          color="bg-green-500"
          subtitle={`معدل الإنجاز ${stats.completionRate}%`}
        />
        
        <StatCard
          title="تصاريح معلقة"
          value={stats.pendingPermits}
          icon={Clock}
          color="bg-yellow-500"
          subtitle="تحتاج مراجعة"
        />
        
        <StatCard
          title="موافقات اليوم"
          value={stats.approvedToday}
          icon={CheckCircle}
          color="bg-purple-500"
          subtitle="تم اعتمادها اليوم"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            النشاط الأخير
          </h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <ActivityItem key={`${activity.type}-${index}`} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا يوجد نشاط حديث
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          {/* System Health */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              حالة النظام
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">قاعدة البيانات</span>
                <Badge variant="success">متصلة</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">التخزين</span>
                <Badge variant="success">طبيعي</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">الإشعارات</span>
                <Badge variant="success">تعمل</Badge>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              إجراءات سريعة
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                إرسال إشعار عام
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                تصدير تقرير اليومي
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                نسخ احتياطي للبيانات
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}