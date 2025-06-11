import jwt from 'jsonwebtoken'
import { memos, saveMemos, generateId, shops } from '../../../lib/data'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

function verifyToken(req) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('No token provided')
  return jwt.verify(token, JWT_SECRET)
}

export default async function handler(req, res) {
  try {
    const user = verifyToken(req)

    switch (req.method) {
      case 'GET':
        return handleGetNotifications(req, res, user)
      case 'POST':
        return handleCreateNotification(req, res, user)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Notifications API error:', error)
    if (error.name === 'JsonWebTokenError' || error.message === 'No token provided') {
      return res.status(401).json({ message: 'غير مخول' })
    }
    return res.status(500).json({ message: 'حدث خطأ في الخادم' })
  }
}

async function handleGetNotifications(req, res, user) {
  let filteredMemos = [...memos]

  // Filter notifications based on user role
  if (user.role === 'tenant') {
    filteredMemos = memos.filter(memo => 
      memo.recipients.includes('all_shops') || 
      memo.recipients.includes(user.shopId) ||
      memo.recipients.includes('all_tenants')
    )
  } else {
    // Staff can see all notifications
    filteredMemos = memos.filter(memo => 
      memo.recipients.includes('all_staff') || 
      memo.recipients.includes(user.role) ||
      memo.recipients.includes('all')
    )
  }

  // Apply query filters
  const { priority, since } = req.query
  
  if (priority) {
    filteredMemos = filteredMemos.filter(memo => memo.priority === priority)
  }
  
  if (since) {
    filteredMemos = filteredMemos.filter(memo => memo.timestamp >= since)
  }

  // Sort by timestamp (newest first)
  filteredMemos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  res.status(200).json({ notifications: filteredMemos })
}

async function handleCreateNotification(req, res, user) {
  // Only admin and operations can create notifications
  if (!['admin', 'operations'].includes(user.role)) {
    return res.status(403).json({ message: 'غير مخول لإنشاء الإشعارات' })
  }

  const {
    subject,
    content,
    priority,
    recipients
  } = req.body

  // Validate required fields
  if (!subject || !content || !priority || !recipients || recipients.length === 0) {
    return res.status(400).json({ 
      message: 'العنوان والمحتوى والأولوية والمستقبلين مطلوبة' 
    })
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high', 'urgent']
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ 
      message: 'مستوى الأولوية غير صالح' 
    })
  }

  // Create new notification
  const newMemo = {
    id: generateId('memo-'),
    subject,
    content,
    priority,
    from: user.email,
    fromName: user.name,
    recipients,
    timestamp: new Date().toISOString(),
    createdBy: user.userId
  }

  memos.push(newMemo)
  saveMemos(memos)

  res.status(201).json({ 
    message: 'تم إنشاء الإشعار بنجاح',
    notification: newMemo
  })
}