import jwt from 'jsonwebtoken'
import { shops, users, saveShops, saveUsers, findShopById } from '../../../lib/data'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

function verifyToken(req) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('No token provided')
  return jwt.verify(token, JWT_SECRET)
}

export default async function handler(req, res) {
  try {
    const user = verifyToken(req)
    const { id } = req.query

    switch (req.method) {
      case 'GET':
        return handleGetShop(req, res, user, id)
      case 'PUT':
        return handleUpdateShop(req, res, user, id)
      case 'DELETE':
        return handleDeleteShop(req, res, user, id)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Shop API error:', error)
    if (error.name === 'JsonWebTokenError' || error.message === 'No token provided') {
      return res.status(401).json({ message: 'غير مخول' })
    }
    return res.status(500).json({ message: 'حدث خطأ في الخادم' })
  }
}

async function handleGetShop(req, res, user, id) {
  const shop = findShopById(id)
  
  if (!shop) {
    return res.status(404).json({ message: 'المتجر غير موجود' })
  }

  // Tenants can only view their own shop
  if (user.role === 'tenant' && shop.id !== user.shopId) {
    return res.status(403).json({ message: 'غير مخول لعرض هذا المتجر' })
  }

  res.status(200).json({ shop })
}

async function handleUpdateShop(req, res, user, id) {
  // Only admin and operations can update shops (except tenant updating their own profile)
  if (!['admin', 'operations'].includes(user.role) && 
      !(user.role === 'tenant' && user.shopId === id)) {
    return res.status(403).json({ message: 'غير مخول لتعديل المتاجر' })
  }

  const shopIndex = shops.findIndex(s => s.id === id)
  
  if (shopIndex === -1) {
    return res.status(404).json({ message: 'المتجر غير موجود' })
  }

  const shop = shops[shopIndex]
  
  // If tenant is updating their own shop, limit what they can change
  let updateData = { ...req.body }
  if (user.role === 'tenant') {
    // Tenants can only update contact information
    updateData = {
      contactName: req.body.contactName,
      contactPhone: req.body.contactPhone,
      contactEmail: req.body.contactEmail
    }
  }

  const updatedShop = {
    ...shop,
    ...updateData,
    updatedAt: new Date().toISOString()
  }

  shops[shopIndex] = updatedShop
  saveShops(shops)

  res.status(200).json({ 
    message: 'تم تحديث المتجر بنجاح',
    shop: updatedShop 
  })
}

async function handleDeleteShop(req, res, user, id) {
  // Only admin can delete shops
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'غير مخول لحذف المتاجر' })
  }

  const shopIndex = shops.findIndex(s => s.id === id)
  
  if (shopIndex === -1) {
    return res.status(404).json({ message: 'المتجر غير موجود' })
  }

  const shop = shops[shopIndex]
  
  // Also remove the associated user account
  const userIndex = users.findIndex(u => u.shopId === id)
  if (userIndex !== -1) {
    users.splice(userIndex, 1)
    saveUsers(users)
  }

  shops.splice(shopIndex, 1)
  saveShops(shops)

  res.status(200).json({ message: 'تم حذف المتجر بنجاح' })
}