import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useData } from '../../../contexts/DataContext'
import { useTranslation } from 'react-i18next'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Eye,
  Download
} from 'lucide-react'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Badge from '../../ui/Badge'
import { formatDate, getRelativeTime, getStatusColor } from '../../../lib/utils'

export default function TenantDashboard() {
  const { user } = useAuth()
  const { permits } = useData()
  const { t } = useTranslation()
  const [myPermits, setMyPermits] = useState([])
  const [stats, setStats] = useState({})

  useEffect(() => {
    if (user && permits) {
      const shopPermits = permits.filter(p => p.shopId === user.shopId)
      setMyPermits(shopPermits)
      
      // Calculate stats
      setStats({
        total: shopPermits.length,
        pending: shopPermits.filter(p => p.status === 'pending').length,
        approved: shopPermits.filter(p => p.status === 'approved').length,
        inProgress: shopPermits.filter(p => p.status === 'in_progress').length,
        completed: shopPermits.filter(p => p.status === 'completed').length
      })
    }
  }, [user, permits])

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

  const recentPermits = myPermits
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-2">
          مرحباً بك في نظام التصاريح
        </h2>
        <p className="text-primary-100">
          يمكنك من هنا إدارة جميع طلبات التصاريح الخاصة بمتجرك
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي التصاريح"
          value={stats.total || 0}
          icon={FileText}
          color="bg-blue-500"
        />
        
        <StatCard
          title="في الانتظار"
          value={stats.pending || 0}
          icon={Clock}
          color="bg-yellow-500"
          subtitle="تحتاج مراجعة"
        />
        
        <StatCard
          title="معتمدة"
          value={stats.approved || 0}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle="جاهزة للتنفيذ"
        />
        
        <StatCard
          title="قيد التنفيذ"
          value={stats.inProgress || 0}
          icon={AlertTriangle}
          color="bg-orange-500"
          subtitle="جارية حالياً"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          إجراءات سريعة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="justify-start h-auto p-4"
            variant="outline"
          >
            <div className="flex items-center space-x-3">
              <Plus className="h-8 w-8 text-primary-600" />
              <div className="text-right">
                <div className="font-medium">تصريح جديد</div>
                <div className="text-sm text-gray-500">إنشاء طلب تصريح عمل</div>
              </div>
            </div>
          </Button>
          
          <Button 
            className="justify-start h-auto p-4"
            variant="outline"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="text-right">
                <div className="font-medium">تصاريحي</div>
                <div className="text-sm text-gray-500">عرض جميع التصاريح</div>
              </div>
            </div>
          </Button>
          
          <Button 
            className="justify-start h-auto p-4"
            variant="outline"
          >
            <div className="flex items-center space-x-3">
              <Download className="h-8 w-8 text-green-600" />
              <div className="text-right">
                <div className="font-medium">التقارير</div>
                <div className="text-sm text-gray-500">تصدير البيانات</div>
              </div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Permits */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            التصاريح الأخيرة
          </h3>
          <Button variant="outline" size="sm">
            عرض الكل
          </Button>
        </div>
        
        {recentPermits.length > 0 ? (
          <div className="space-y-4">
            {recentPermits.map((permit) => (
              <div 
                key={permit.id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {permit.id}
                      </h4>
                      <Badge variant={getStatusColor(permit.status).replace('bg-', '').replace('-100', '').replace(' text-', '').replace('-800', '')}>
                        {t(permit.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {permit.workDescription}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>الموقع: {permit.location}</span>
                      <span>التاريخ: {formatDate(permit.startDate)}</span>
                      <span>{getRelativeTime(permit.createdAt)}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد تصاريح بعد
            </h3>
            <p className="text-gray-600 mb-4">
              ابدأ بإنشاء أول تصريح عمل لمتجرك
            </p>
            <Button icon={Plus}>
              إنشاء تصريح جديد
            </Button>
          </div>
        )}
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          نصائح مهمة
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>تأكد من رفع جميع المستندات المطلوبة قبل إرسال طلب التصريح</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>للأعمال الثقيلة، يجب إرفاق شهادة التأمين</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>يمكنك متابعة حالة التصريح في أي وقت من قسم "تصاريحي"</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>في حالة الرفض، ستتلقى تفاصيل الأسباب وكيفية التعديل</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}