import { Bell, AlertCircle, Info, CheckCircle } from 'lucide-react'
import Badge from '../ui/Badge'

export default function NotificationItem({ notification, onClick, isRead = false }) {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
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

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'danger'
      case 'high':
        return 'warning'
      case 'medium':
        return 'primary'
      case 'low':
        return 'success'
      default:
        return 'secondary'
    }
  }

  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isRead 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-white border-blue-200 hover:bg-blue-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {getPriorityIcon(notification.priority)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-medium truncate ${
              isRead ? 'text-gray-600' : 'text-gray-900'
            }`}>
              {notification.subject}
            </h4>
            <Badge 
              variant={getPriorityVariant(notification.priority)}
              size="sm"
            >
              {getPriorityLabel(notification.priority)}
            </Badge>
          </div>
          <p className={`text-sm mb-2 line-clamp-2 ${
            isRead ? 'text-gray-500' : 'text-gray-700'
          }`}>
            {notification.content}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>من: {notification.fromName}</span>
            <span>{new Date(notification.timestamp).toLocaleString('ar-SA')}</span>
          </div>
        </div>
        {!isRead && (
          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  )
}