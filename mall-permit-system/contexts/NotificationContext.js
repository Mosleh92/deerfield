import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

const NotificationContext = createContext()

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [memos, setMemos] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    loadMemos()
  }, [])

  const loadNotifications = () => {
    const saved = localStorage.getItem('mall_notifications')
    if (saved) {
      const parsed = JSON.parse(saved)
      setNotifications(parsed)
      setUnreadCount(parsed.filter(n => !n.read).length)
    }
  }

  const loadMemos = () => {
    const saved = localStorage.getItem('mall_memos')
    if (saved) {
      setMemos(JSON.parse(saved))
    }
  }

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }

    const updated = [newNotification, ...notifications]
    setNotifications(updated)
    setUnreadCount(prev => prev + 1)
    localStorage.setItem('mall_notifications', JSON.stringify(updated))

    // Show toast
    toast(notification.message, {
      icon: getToastIcon(notification.type),
      duration: 4000
    })
  }

  const markAsRead = (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    setUnreadCount(prev => Math.max(0, prev - 1))
    localStorage.setItem('mall_notifications', JSON.stringify(updated))
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    setUnreadCount(0)
    localStorage.setItem('mall_notifications', JSON.stringify(updated))
  }

  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id)
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    
    localStorage.setItem('mall_notifications', JSON.stringify(updated))
  }

  const sendMemo = (memo) => {
    const newMemo = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...memo
    }

    const updated = [newMemo, ...memos]
    setMemos(updated)
    localStorage.setItem('mall_memos', JSON.stringify(updated))

    // Create notification for memo
    addNotification({
      type: 'memo',
      title: 'مذكرة جديدة',
      message: memo.subject,
      from: memo.from
    })
  }

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      case 'memo': return '📋'
      default: return '🔔'
    }
  }

  const value = {
    notifications,
    memos,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendMemo
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}