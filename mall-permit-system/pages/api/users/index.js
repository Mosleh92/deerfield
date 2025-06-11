import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { users, saveUsers, generateId } from '../../../lib/data'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

function verifyToken(req) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('No token provided')
  return jwt.verify(token, JWT_SECRET)
}

export default async function handler(req, res) {
  try {
    const user = verifyToken(req)

    // Only admin and operations can manage users
    if (!['admin', 'operations'].includes(user.role)) {
      return res.status(403).json({ message: 'غير مخول لإدارة المستخدمين' })
    }

    switch (req.method) {
      case 'GET':
        return handleGetUsers(req, res, user)
      case 'POST':
        return handleCreateUser(req, res, user)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Users API error:', error)
    if (error.name === 'JsonWebTokenError' || error.message === 'No token provided') {
      return res.status(401).json({ message: 'غير مخول' })
    }
    return res.status(500).json({ message: 'حدث خطأ في الخادم' })
  }
}

async function handleGetUsers(req, res, user) {
  const { role, status, search } = req.query
  let filteredUsers = [...users]

  // Remove passwords from all users
  filteredUsers = filteredUsers.map(({ password, ...userWithoutPassword }) => userWithoutPassword)

  if (role) {
    filteredUsers = filteredUsers.filter(u => u.role === role)
  }

  if (status) {
    filteredUsers = filteredUsers.filter(u => u.status === status)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filteredUsers = filteredUsers.filter(u => 
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      (u.shopName && u.shopName.toLowerCase().includes(searchLower))
    )
  }

  // Sort by creation date (newest first)
  filteredUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.status(200).json({ users: filteredUsers })
}

async function handleCreateUser(req, res, user) {
  const {
    email,
    password,
    name,
    role,
    shopId,
    shopName
  } = req.body

  // Validate required fields
  if (!email || !password || !name || !role) {
    return res.status(400).json({ 
      message: 'البريد الإلكتروني وكلمة المرور والاسم والدور مطلوبة' 
    })
  }

  // Validate role
  const validRoles = ['admin', 'operations', 'technical', 'security', 'tenant']
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      message: 'الدور المحدد غير صالح' 
    })
  }

  // Check if email already exists
  const existingUser = users.find(u => u.email === email)
  if (existingUser) {
    return res.status(400).json({ 
      message: 'البريد الإلكتروني موجود مسبقاً' 
    })
  }

  // Validate tenant role requirements
  if (role === 'tenant' && !shopId) {
    return res.status(400).json({ 
      message: 'معرف المتجر مطلوب للمستأجرين' 
    })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create new user
  const newUser = {
    id: generateId('user-'),
    email,
    password: hashedPassword,
    name,
    role,
    shopId: role === 'tenant' ? shopId : null,
    shopName: role === 'tenant' ? shopName : null,
    status: 'active',
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  saveUsers(users)

  // Remove password from response
  const { password: _, ...userWithoutPassword } = newUser

  res.status(201).json({ 
    message: 'تم إنشاء المستخدم بنجاح',
    user: userWithoutPassword
  })
}