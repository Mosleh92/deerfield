import { MongoClient, ServerApiVersion } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('لطفاً أضف MONGODB_URI إلى .env.local')
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  // في development mode، استخدم global variable لتجنب اتصالات متعددة
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // في production mode
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// تست الاتصال
export async function testConnection() {
  try {
    const client = await clientPromise
    // إرسال ping للتأكد من الاتصال
    await client.db("admin").command({ ping: 1 })
    console.log("✅ تم الاتصال بـ MongoDB Atlas بنجاح!")
    return true
  } catch (error) {
    console.error("❌ خطأ في الاتصال بـ MongoDB:", error)
    return false
  }
}

export default clientPromise