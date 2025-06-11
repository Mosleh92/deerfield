import { useState, useEffect } from 'react'
import { Bell, MessageSquare, AlertCircle, Info, CheckCircle } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

export default function NotificationList() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'medium':
        return <Info className="h-5 w-5 text-blue-500" />
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityLabel = (priority) => {
    const labels = {
      urgent: 'عاجل',
      high: 'مهم',
      medium: 'متوسط',
      low: 'منخفض'
    }
    return labels[priority] || priority
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    return notification.priority === filter
  })

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل الإشعارات...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
            <p className="text-gray-600">إشعارات ومذكرات النظام</p>
          </div>
        </div>
        
        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">فلترة:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">جميع الإشعارات</option>
            <option value="urgent">عاجل</option>
            <option value="high">مهم</option>
            <option value="medium">متوسط</option>
            <option value="low">منخفض</option>
          </select>
        </div>
      </div>

      <Card>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationItem 
                key={notification.id}
                notification={notification}
                onRead={() => {
                  // Mark as read functionality
                }}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function NotificationItem({ notification, onRead }) {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'medium':
        return <Info className="h-5 w-5 text-blue-500" />
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-r-red-500 bg-red-50'
      case 'high':
        return 'border-r-orange-500 bg-orange-50'
      case 'medium':
        return 'border-r-blue-500 bg-blue-50'
      case 'low':
        return 'border-r-green-500 bg-green-50'
      default:
        return 'border-r-gray-500 bg-gray-50'
    }
  }

  return (
    <div className={`p-4 border-r-4 rounded-lg ${getPriorityColor(notification.priority)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getPriorityIcon(notification.priority)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-gray-900">{notification.subject}</h3>
              <Badge 
                variant={notification.priority === 'urgent' ? 'danger' : 
                        notification.priority === 'high' ? 'warning' : 'secondary'}
                size="sm"
              >
                {notification.priority === 'urgent' ? 'عاجل' :
                 notification.priority === 'high' ? 'مهم' :
                 notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
              </Badge>
            </div>
            <p className="text-gray-700 text-sm mb-3">{notification.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>من: {notification.fromName}</span>
              <span>{new Date(notification.timestamp).toLocaleString('ar-SA')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}