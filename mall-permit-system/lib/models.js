import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('لطفاً أضف MONGODB_URI إلى .env.local')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // إضافة خيارات إضافية لـ Atlas
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // استخدام IPv4
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ تم الاتصال بـ MongoDB Atlas عبر Mongoose')
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('❌ خطأ في الاتصال بـ MongoDB:', e)
    throw e
  }

  return cached.conn
}

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'operations', 'technical', 'security', 'tenant'],
    required: true 
  },
  shopId: { type: String, default: null },
  shopName: { type: String, default: null },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'users' // تحديد اسم الـ collection صراحة
})

// Shop Schema
const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  shopNumber: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactEmail: { type: String },
  systemEmail: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'shops'
})

// Permit Schema
const permitSchema = new mongoose.Schema({
  permitId: { type: String, required: true, unique: true },
  shopId: { type: String, required: true },
  shopName: { type: String, required: true },
  workType: { 
    type: String, 
    enum: ['light_work', 'medium_work', 'heavy_work', 'electrical', 'plumbing', 'renovation'],
    required: true 
  },
  workDescription: { type: String, required: true },
  location: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  contractorName: { type: String, required: true },
  workerCount: { type: Number, required: true },
  emergencyContact: { type: String, required: true },
  equipmentNeeded: [String],
  insuranceRequired: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed'],
    default: 'pending' 
  },
  submittedBy: { type: String, required: true },
  approvals: {
    technical: {
      status: { type: String, enum: ['approved', 'rejected'] },
      approvedBy: String,
      approvedAt: Date,
      comments: String
    },
    security: {
      status: { type: String, enum: ['approved', 'rejected'] },
      approvedBy: String,
      approvedAt: Date,
      comments: String
    },
    management: {
      status: { type: String, enum: ['approved', 'rejected'] },
      approvedBy: String,
      approvedAt: Date,
      comments: String
    }
  },
  documents: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedBy: String,
    uploadedAt: Date
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'permits'
})

// Memo/Notification Schema
const memoSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  from: { type: String, required: true },
  fromName: { type: String, required: true },
  recipients: [String],
  createdBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  collection: 'memos'
})

// Export models
export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema)
export const Permit = mongoose.models.Permit || mongoose.model('Permit', permitSchema)
export const Memo = mongoose.models.Memo || mongoose.model('Memo', memoSchema)

export default dbConnect