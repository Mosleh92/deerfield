import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { users, saveUsers, findUserById } from '../../../lib/data'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

function verifyToken(req) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('No token provided')
  return jwt.verify(token, JWT_SECRET)
}

export default async function handler(req, res) {
  try {
    const currentUser = verifyToken(req)
    const { id } = req.query

    switch (req.method) {
      case 'GET':
        return handleGetUser(req, res, currentUser, id)
      case 'PUT':
        return handleUpdateUser(req, res, currentUser, id)
      case 'DELETE':
        return handleDeleteUser(req, res, currentUser, id)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('User API error:', error)
    if (error.name === 'JsonWebTokenError' || error.message === 'No token provided') {
      return res.status(401).json({ message: 'غير مخول' })
    }
    return res.status(500).json({ message: 'حدث خطأ في الخادم' })
  }
}

async function handleGetUser(req, res, currentUser, id) {
  const user = findUserById(id)
  
  if (!user) {
    return res.status(404).json({ message: 'المستخدم غير موجود' })
  }

  // Users can view their own profile, admin/operations can view all
  if (currentUser.userId !== id && !['admin', 'operations'].includes(currentUser.role)) {
    return res.status(403).json({ message: 'غير مخول لعرض هذا المستخدم' })
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user

  res.status(200).json({ user: userWithoutPassword })
}

async function handleUpdateUser(req, res, currentUser, id) {
  const userIndex = users.findIndex(u => u.id === id)
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'المستخدم غير موجود' })
  }

  const user = users[userIndex]

  // Users can update their own profile, admin/operations can update others
  if (currentUser.userId !== id && !['admin', 'operations'].includes(currentUser.role)) {
    return res.status(403).json({ message: 'غير مخول لتعديل هذا المستخدم' })
  }

  let updateData = { ...req.body }

  // If user is updating their own profile, limit what they can change
  if (currentUser.userId === id && !['admin', 'operations'].includes(currentUser.role)) {
    updateData = {
      name: req.body.name,
      // Users can't change their own role, email, or status
    }
  }

  // Handle password change
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 12)
  }

  // Handle role changes (only admin can change roles)
  if (updateData.role && currentUser.role !== 'admin') {
    delete updateData.role
  }

  const updatedUser = {
    ...user,
    ...updateData,
    updatedAt: new Date().toISOString()
  }

  users[userIndex] = updatedUser
  saveUsers(users)

  // Remove password from response
  const { password, ...userWithoutPassword } = updatedUser

  res.status(200).json({ 
    message: 'تم تحديث المستخدم بنجاح',
    user: userWithoutPassword 
  })
}

async function handleDeleteUser(req, res, currentUser, id) {
  // Only admin can delete users
  if (currentUser.role !== 'admin') {
    return res.status(403).json({ message: 'غير مخول لحذف المستخدمين' })
  }

  // Can't delete yourself
  if (currentUser.userId === id) {
    return res.status(400).json({ message: 'لا يمكن حذف حسابك الخاص' })
  }

  const userIndex = users.findIndex(u => u.id === id)
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'المستخدم غير موجود' })
  }

  users.splice(userIndex, 1)
  saveUsers(users)

  res.status(200).json({ message: 'تم حذف المستخدم بنجاح' })
}