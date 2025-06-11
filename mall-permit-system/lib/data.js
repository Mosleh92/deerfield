import dbConnect, { User, Shop, Permit, Memo } from './models'
import bcrypt from 'bcryptjs'

// تابع برای ایجاد داده‌های اولیه
export async function initializeDatabase() {
  await dbConnect()

  // بررسی وجود داده‌های اولیه
  const adminExists = await User.findOne({ email: 'admin@mall.com' })
  
  if (!adminExists) {
    console.log('ایجاد داده‌های اولیه...')
    
    // ایجاد کاربران اولیه
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const initialUsers = [
      {
        email: 'admin@mall.com',
        password: hashedPassword,
        name: 'مدير النظام',
        role: 'admin',
        status: 'active'
      },
      {
        email: 'operations@mall.com',
        password: hashedPassword,
        name: 'إدارة العمليات',
        role: 'operations',
        status: 'active'
      },
      {
        email: 'technical@mall.com',
        password: hashedPassword,
        name: 'القسم الفني',
        role: 'technical',
        status: 'active'
      },
      {
        email: 'security@mall.com',
        password: hashedPassword,
        name: 'قسم الأمن',
        role: 'security',
        status: 'active'
      }
    ]

    await User.insertMany(initialUsers)

    // ایجاد متجر نمونه
    const shop = new Shop({
      shopName: 'متجر الأزياء العصرية',
      shopNumber: 'A-101',
      category: 'fashion',
      contactName: 'أحمد محمد',
      contactPhone: '+966501234567',
      contactEmail: 'shop1@mall.com',
      systemEmail: 'shop1@mall.com',
      status: 'active'
    })
    await shop.save()

    // ایجاد کاربر متجر
    const shopUser = new User({
      email: 'shop1@mall.com',
      password: hashedPassword,
      name: 'متجر الأزياء العصرية',
      role: 'tenant',
      shopId: shop._id.toString(),
      shopName: 'متجر الأزياء العصرية',
      status: 'active'
    })
    await shopUser.save()

    console.log('داده‌های اولیه ایجاد شدند')
  }
}

// Helper functions
export async function findUserByEmail(email) {
  await dbConnect()
  return await User.findOne({ email }).lean()
}

export async function findUserById(id) {
  await dbConnect()
  return await User.findById(id).lean()
}

export async function findShopById(id) {
  await dbConnect()
  return await Shop.findById(id).lean()
}

export async function findPermitById(id) {
  await dbConnect()
  return await Permit.findOne({ permitId: id }).lean()
}

export async function getAllUsers(filter = {}) {
  await dbConnect()
  return await User.find(filter).select('-password').lean()
}

export async function getAllShops(filter = {}) {
  await dbConnect()
  return await Shop.find(filter).lean()
}

export async function getAllPermits(filter = {}) {
  await dbConnect()
  return await Permit.find(filter).lean()
}

export async function getAllMemos(filter = {}) {
  await dbConnect()
  return await Memo.find(filter).lean()
}

export function generateId(prefix = '') {
  return prefix + Date.now() + Math.random().toString(36).substr(2, 9)
}

export function generatePermitId() {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `PTW-${year}-${random}`
}