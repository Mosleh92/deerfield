import bcrypt from 'bcryptjs'
import dbConnect, { User, Shop } from '../../lib/models'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await dbConnect()
    
    // التحقق من وجود بيانات أولية
    const adminExists = await User.findOne({ email: 'admin@mall.com' })
    
    if (adminExists) {
      return res.status(200).json({ 
        message: 'البيانات الأولية موجودة مسبقاً',
        alreadyInitialized: true
      })
    }

    console.log('🔄 إنشاء البيانات الأولية...')
    
    // هاش كلمة المرور
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    // إنشاء المستخدمين الأوليين
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

    const createdUsers = await User.insertMany(initialUsers)
    console.log(`✅ تم إنشاء ${createdUsers.length} مستخدم`)

    // إنشاء متجر تجريبي
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
    
    const savedShop = await shop.save()
    console.log('✅ تم إنشاء متجر تجريبي')

    // إنشاء مستخدم المتجر
    const shopUser = new User({
      email: 'shop1@mall.com',
      password: hashedPassword,
      name: 'متجر الأزياء العصرية',
      role: 'tenant',
      shopId: savedShop._id.toString(),
      shopName: 'متجر الأزياء العصرية',
      status: 'active'
    })
    
    await shopUser.save()
    console.log('✅ تم إنشاء مستخدم المتجر')

    res.status(200).json({ 
      message: 'تم إنشاء البيانات الأولية بنجاح!',
      usersCreated: createdUsers.length + 1, // +1 للمتجر
      shopsCreated: 1,
      credentials: {
        admin: { email: 'admin@mall.com', password: 'password123' },
        operations: { email: 'operations@mall.com', password: 'password123' },
        technical: { email: 'technical@mall.com', password: 'password123' },
        security: { email: 'security@mall.com', password: 'password123' },
        shop: { email: 'shop1@mall.com', password: 'password123' }
      }
    })

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات الأولية:', error)
    res.status(500).json({ 
      message: 'فشل في إنشاء البيانات الأولية',
      error: error.message 
    })
  }
}