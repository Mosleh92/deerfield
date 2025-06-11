import { testConnection } from '../../lib/mongodb'
import dbConnect from '../../lib/models'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('🔄 اختبار الاتصال بـ MongoDB Atlas...')
    
    // تست اتصال MongoDB native
    const mongoConnection = await testConnection()
    
    // تست اتصال Mongoose
    await dbConnect()
    
    res.status(200).json({ 
      success: true,
      message: 'تم الاتصال بـ MongoDB Atlas بنجاح!',
      mongoConnection,
      mongooseConnection: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ خطأ في اختبار الاتصال:', error)
    res.status(500).json({ 
      success: false,
      message: 'فشل الاتصال بقاعدة البيانات',
      error: error.message 
    })
  }
}