import jwt from 'jsonwebtoken'
import { findUserById } from '../../../lib/data'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get token from cookie or header
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'غير مخول' })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Find user
    const user = findUserById(decoded.userId)
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' })
    }

    // Check if user is still active
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'الحساب غير نشط' })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    res.status(200).json({ user: userWithoutPassword })

  } catch (error) {
    console.error('Auth error:', error)
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'رمز التوثيق غير صالح' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'انتهت صلاحية رمز التوثيق' })
    }
    res.status(500).json({ message: 'حدث خطأ في الخادم' })
  }
}