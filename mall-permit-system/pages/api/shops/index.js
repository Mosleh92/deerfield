import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { shops, users, saveShops, saveUsers, generateId } from '../../../lib/data'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

function verifyToken(req) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('No token provided')
  return jwt.verify(token, JWT_SECRET)
}

export default async function handler(req, res) {
  try {
    const user = verifyToken(req)

    // Only admin and operations can manage shops
    if (!['admin', 'operations'].includes(user.role)) {
      return res.status(403).json({ message: 'غير مخول لإدارة المتاجر' })
    }

    switch (req.method) {
      case 'GET':
        return handleGetShops(req, res, user)
      case 'POST':
        return handleCreateShop(req, res, user)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Shops API error:', error)
    if (error.name === 'JsonWebTokenError' || error.message === 'No token provided') {
      return res.status(401).json({ message: 'غير مخول' })
    }
    return res.status(500).json({ message: 'حدث خطأ في الخادم' })
  }
}

async function handleGetShops(req, res, user) {
  const { status, category, search } = req.query
  let filteredShops = [...shops]

  if (status) {
    filteredShops = filteredShops.filter(shop => shop.status === status)
  }

  if (category) {
    filteredShops = filteredShops.filter(shop => shop.category === category)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filteredShops = filteredShops.filter(shop => 
      shop.shopName.toLowerCase().includes(searchLower) ||
      shop.shopNumber.toLowerCase().includes(searchLower) ||
      shop.contactName.toLowerCase().includes(searchLower)
    )
  }

  // Sort by creation date (newest first)
  filteredShops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.status(200).json({ shops: filteredShops })
}

async function handleCreateShop(req, res, user) {
  const {
    shopName,
    shopNumber,
    category,
    contactName,
    contactPhone,
    contactEmail,
    systemEmail
  } = req.body

  // Validate required fields
  if (!shopName || !shopNumber || !category || !contactName || !contactPhone || !systemEmail) {
    return res.status(400).json({ 
      message: 'جميع الحقول المطلوبة يجب ملؤها' 
    })
  }

  // Check if shop number already exists
  const existingShop = shops.find(shop => shop.shopNumber === shopNumber)
  if (existingShop) {
    return res.status(400).json({ 
      message: 'رقم المتجر موجود مسبقاً' 
    })
  }

  // Check if system email already exists
  const existingUser = users.find(user => user.email === systemEmail)
  if (existingUser) {
    return res.status(400).json({ 
      message: 'البريد الإلكتروني للنظام موجود مسبقاً' 
    })
  }

  // Generate shop ID and password
  const shopId = generateId('shop-')
  const generatedPassword = generateRandomPassword()
  const hashedPassword = await bcrypt.hash(generatedPassword, 12)

  // Create shop
  const newShop = {
    id: shopId,
    shopName,
    shopNumber,
    category,
    contactName,
    contactPhone,
    contactEmail: contactEmail || systemEmail,
    systemEmail,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  // Create user account for shop
  const newUser = {
    id: generateId('user-'),
    email: systemEmail,
    password: hashedPassword,
    name: shopName,
    role: 'tenant',
    shopId: shopId,
    shopName: shopName,
    status: 'active',
    createdAt: new Date().toISOString()
  }

  // Save to data
  shops.push(newShop)
  users.push(newUser)
  saveShops(shops)
  saveUsers(users)

  res.status(201).json({ 
    message: 'تم إنشاء المتجر بنجاح',
    shop: newShop,
    credentials: {
      email: systemEmail,
      password: generatedPassword
    }
  })
}

function generateRandomPassword() {
  const length = 12
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return password
}