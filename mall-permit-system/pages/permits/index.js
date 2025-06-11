import jwt from 'jsonwebtoken'
import { permits, savePermits, generateId } from '../../../lib/data'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

// Middleware to verify token and get user info
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
        return handleGetPermits(req, res, user)
      case 'POST':
        return handleCreatePermit(req, res, user)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Permits API error:', error)
    if (error.name === 'JsonWebTokenError' || error.message === 'No token provided') {
      return res.status(401).json({ message: 'غير مخول' })
    }
    return res.status(500).json({ message: 'حدث خطأ في الخادم' })
  }
}

async function handleGetPermits(req, res, user) {
  let filteredPermits = [...permits]

  // Filter based on user role
  if (user.role === 'tenant') {
    filteredPermits = permits.filter(permit => permit.shopId === user.shopId)
  } else if (user.role === 'technical') {
    // Technical can see permits that need technical approval or are approved by technical
    filteredPermits = permits.filter(permit => 
      permit.status === 'pending' || 
      permit.approvals?.technical?.status
    )
  } else if (user.role === 'security') {
    // Security can see permits that need security approval
    filteredPermits = permits.filter(permit => 
      permit.approvals?.technical?.status === 'approved' ||
      permit.approvals?.security?.status
    )
  }
  // Admin and operations can see all permits

  // Apply query filters
  const { status, shopId, startDate, endDate } = req.query
  
  if (status) {
    filteredPermits = filteredPermits.filter(permit => permit.status === status)
  }
  
  if (shopId && user.role !== 'tenant') {
    filteredPermits = filteredPermits.filter(permit => permit.shopId === shopId)
  }
  
  if (startDate) {
    filteredPermits = filteredPermits.filter(permit => permit.startDate >= startDate)
  }
  
  if (endDate) {
    filteredPermits = filteredPermits.filter(permit => permit.endDate <= endDate)
  }

  // Sort by creation date (newest first)
  filteredPermits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.status(200).json({ permits: filteredPermits })
}

async function handleCreatePermit(req, res, user) {
  // Only tenants can create permits
  if (user.role !== 'tenant') {
    return res.status(403).json({ message: 'غير مخول لإنشاء تصاريح' })
  }

  const {
    workType,
    workDescription,
    location,
    startDate,
    endDate,
    startTime,
    endTime,
    contractorName,
    workerCount,
    emergencyContact,
    equipmentNeeded,
    insuranceRequired
  } = req.body

  // Validate required fields
  if (!workType || !workDescription || !location || !startDate || !endDate || 
      !startTime || !endTime || !contractorName || !workerCount || !emergencyContact) {
    return res.status(400).json({ 
      message: 'جميع الحقول المطلوبة يجب ملؤها' 
    })
  }

  // Generate permit ID
  const permitId = `PTW-${new Date().getFullYear()}-${String(permits.length + 1).padStart(3, '0')}`

  const newPermit = {
    id: permitId,
    shopId: user.shopId,
    shopName: user.shopName || 'متجر غير معروف',
    workType,
    workDescription,
    location,
    startDate,
    endDate,
    startTime,
    endTime,
    contractorName,
    workerCount: parseInt(workerCount),
    emergencyContact,
    equipmentNeeded: equipmentNeeded || [],
    insuranceRequired: insuranceRequired || false,
    status: 'pending',
    submittedBy: user.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvals: {},
    documents: []
  }

  permits.push(newPermit)
  savePermits(permits)

  res.status(201).json({ 
    message: 'تم إنشاء التصريح بنجاح',
    permit: newPermit 
  })
}