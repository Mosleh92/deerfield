import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { findUserByEmail, initializeDatabase } from '../../../lib/data'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Initialize database with sample data
    await initializeDatabase()

    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
      })
    }

    // Find user
    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ 
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
      })
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ 
        message: 'الحساب غير نشط، يرجى التواصل مع الإدارة' 
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email, 
        role: user.role,
        shopId: user.shopId || null
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user

    // Set HTTP-only cookie
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`)

    res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      message: 'حدث خطأ في الخادم' 
    })
  }
}