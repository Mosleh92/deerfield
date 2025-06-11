import jwt from 'jsonwebtoken'
import { permits, shops, users, memos } from '../../../lib/data'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

function verifyToken(req) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('No token provided')
  return jwt.verify(token, JWT_SECRET)
}

export default async function handler(req, res) {
  try {
    const user = verifyToken(req)

    // Only admin, operations, and department heads can access reports
    if (!['admin', 'operations', 'technical', 'security'].includes(user.role)) {
      return res.status(403).json({ message: 'غير مخول لعرض التقارير' })
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' })
    }

    const { type, startDate, endDate, shopId, format } = req.query

    let reportData = {}

    switch (type) {
      case 'permits':
        reportData = generatePermitsReport(startDate, endDate, shopId, user)
        break
      case 'shops':
        reportData = generateShopsReport(user)
        break
      case 'activity':
        reportData = generateActivityReport(startDate, endDate, user)
        break
      case 'dashboard':
      default:
        reportData = generateDashboardReport(user)
        break
    }

    res.status(200).json(reportData)

  } catch (error) {
    console.error('Reports API error:', error)
    if (error.name === 'JsonWebTokenError' || error.message === 'No token provided') {
      return res.status(401).json({ message: 'غير مخول' })
    }
    return res.status(500).json({ message: 'حدث خطأ في الخادم' })
  }
}

function generatePermitsReport(startDate, endDate, shopId, user) {
  let filteredPermits = [...permits]

  // Filter by date range
  if (startDate) {
    filteredPermits = filteredPermits.filter(permit => permit.startDate >= startDate)
  }
  if (endDate) {
    filteredPermits = filteredPermits.filter(permit => permit.endDate <= endDate)
  }

  // Filter by shop (if specified and user has permission)
  if (shopId && ['admin', 'operations'].includes(user.role)) {
    filteredPermits = filteredPermits.filter(permit => permit.shopId === shopId)
  }

  // Apply role-based filtering
  if (user.role === 'technical') {
    filteredPermits = permits.filter(permit => 
      permit.status === 'pending' || 
      permit.approvals?.technical?.status
    )
  } else if (user.role === 'security') {
    filteredPermits = permits.filter(permit => 
      permit.approvals?.technical?.status === 'approved' ||
      permit.approvals?.security?.status
    )
  }

  // Generate statistics
  const stats = {
    total: filteredPermits.length,
    pending: filteredPermits.filter(p => p.status === 'pending').length,
    approved: filteredPermits.filter(p => p.status === 'approved').length,
    rejected: filteredPermits.filter(p => p.status === 'rejected').length,
    inProgress: filteredPermits.filter(p => p.status === 'in-progress').length,
    completed: filteredPermits.filter(p => p.status === 'completed').length
  }

  // Work type breakdown
  const workTypes = {}
  filteredPermits.forEach(permit => {
    workTypes[permit.workType] = (workTypes[permit.workType] || 0) + 1
  })

  // Shop breakdown
  const shopBreakdown = {}
  filteredPermits.forEach(permit => {
    shopBreakdown[permit.shopName] = (shopBreakdown[permit.shopName] || 0) + 1
  })

  return {
    type: 'permits',
    stats,
    workTypes,
    shopBreakdown,
    permits: filteredPermits,
    generatedAt: new Date().toISOString()
  }
}

function generateShopsReport(user) {
  if (!['admin', 'operations'].includes(user.role)) {
    return { error: 'غير مخول لعرض تقرير المتاجر' }
  }

  const stats = {
    total: shops.length,
    active: shops.filter(s => s.status === 'active').length,
    inactive: shops.filter(s => s.status === 'inactive').length
  }

  // Category breakdown
  const categories = {}
  shops.forEach(shop => {
    categories[shop.category] = (categories[shop.category] || 0) + 1
  })

  // Recent shops (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentShops = shops.filter(shop => 
    new Date(shop.createdAt) >= thirtyDaysAgo
  )

  return {
    type: 'shops',
    stats,
    categories,
    recentShops,
    shops,
    generatedAt: new Date().toISOString()
  }
}

function generateActivityReport(startDate, endDate, user) {
  let filteredPermits = [...permits]
  let filteredMemos = [...memos]

  // Filter by date range
  if (startDate) {
    filteredPermits = filteredPermits.filter(permit => 
      permit.createdAt >= startDate || permit.updatedAt >= startDate
    )
    filteredMemos = filteredMemos.filter(memo => memo.timestamp >= startDate)
  }

  if (endDate) {
    filteredPermits = filteredPermits.filter(permit => 
      permit.createdAt <= endDate || permit.updatedAt <= endDate
    )
    filteredMemos = filteredMemos.filter(memo => memo.timestamp <= endDate)
  }

  // Recent activity timeline
  const activities = []

  // Add permit activities
  filteredPermits.forEach(permit => {
    activities.push({
      type: 'permit_created',
      timestamp: permit.createdAt,
      description: `تم إنشاء تصريح ${permit.id} بواسطة ${permit.shopName}`,
      permitId: permit.id
    })

    if (permit.updatedAt !== permit.createdAt) {
      activities.push({
        type: 'permit_updated',
        timestamp: permit.updatedAt,
        description: `تم تحديث التصريح ${permit.id}`,
        permitId: permit.id
      })
    }
  })

  // Add memo activities
  filteredMemos.forEach(memo => {
    activities.push({
      type: 'memo_created',
      timestamp: memo.timestamp,
      description: `تم إرسال إشعار: ${memo.subject}`,
      memoId: memo.id
    })
  })

  // Sort by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return {
    type: 'activity',
    activities: activities.slice(0, 50), // Limit to 50 recent activities
    stats: {
      totalActivities: activities.length,
      permitsCreated: filteredPermits.length,
      memosCreated: filteredMemos.length
    },
    generatedAt: new Date().toISOString()
  }
}

function generateDashboardReport(user) {
  const permitStats = {
    total: permits.length,
    pending: permits.filter(p => p.status === 'pending').length,
    approved: permits.filter(p => p.status === 'approved').length,
    rejected: permits.filter(p => p.status === 'rejected').length
  }

  const shopStats = {
    total: shops.length,
    active: shops.filter(s => s.status === 'active').length
  }

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    tenants: users.filter(u => u.role === 'tenant').length,
    staff: users.filter(u => u.role !== 'tenant').length
  }

  // Recent permits (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentPermits = permits.filter(permit => 
    new Date(permit.createdAt) >= sevenDaysAgo
  )

  // Pending approvals for current user
  let pendingApprovals = []
  if (user.role === 'technical') {
    pendingApprovals = permits.filter(permit => 
      permit.status === 'pending' && !permit.approvals?.technical?.status
    )
  } else if (user.role === 'security') {
    pendingApprovals = permits.filter(permit => 
      permit.approvals?.technical?.status === 'approved' && 
      !permit.approvals?.security?.status
    )
  } else if (['operations', 'admin'].includes(user.role)) {
    pendingApprovals = permits.filter(permit => 
      permit.approvals?.technical?.status === 'approved' && 
      permit.approvals?.security?.status === 'approved' &&
      !permit.approvals?.management?.status
    )
  }

  return {
    type: 'dashboard',
    permitStats,
    shopStats,
    userStats,
    recentPermits,
    pendingApprovals,
    generatedAt: new Date().toISOString()
  }
}