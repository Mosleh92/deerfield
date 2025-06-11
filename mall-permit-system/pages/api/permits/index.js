import jwt from 'jsonwebtoken'
import dbConnect, { Permit } from '../../../lib/data'
import { generatePermitId } from '../../../lib/data'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

function verifyToken(req) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('No token provided')
  
  return jwt.verify(token, JWT_SECRET)
}

export default async function handler(req, res) {
  try {
    await dbConnect()
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
  let filter = {}

  // Filter based on user role
  if (user.role === 'tenant') {
    filter.shopId = user.shopId
  } else if (user.role === 'technical') {
    // Technical can see permits that need technical approval or are approved by technical
    filter.$or = [
      { status: 'pending' },
      { 'approvals.technical.status': { $exists: true } }
    ]
  } else if (user.role === 'security') {
    // Security can see permits that need security approval
    filter.$or = [
      { 'approvals.technical.status': 'approved' },
      { 'approvals.security.status': { $exists: true } }
    ]
  }
  // Admin and operations can see all permits

  // Apply query filters
  const { status, shopId, startDate, endDate } = req.query
  
  if (status) {
    filter.status = status
  }
  
  if (shopId && user.role !== 'tenant') {
    filter.shopId = shopId
  }
  
  if (startDate) {
    filter.startDate = { $gte: startDate }
  }
  
  if (endDate) {
    filter.endDate = { $lte: endDate }
  }

  const permits = await Permit.find(filter).sort({ createdAt: -1 }).lean()

  res.status(200).json({ permits })
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
  const permitId = generatePermitId()

  const newPermit = new Permit({
    permitId,
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
    approvals: {},
    documents: []
  })

  await newPermit.save()

  res.status(201).json({ 
    message: 'تم إنشاء التصريح بنجاح',
    permit: newPermit 
  })
}