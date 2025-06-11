import formidable from 'formidable'
import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export const config = {
  api: {
    bodyParser: false,
  },
}

function verifyToken(req) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('No token provided')
  return jwt.verify(token, JWT_SECRET)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const user = verifyToken(req)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filename: (name, ext, part) => {
        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        return `${timestamp}_${randomString}${ext}`
      }
    })

    const [fields, files] = await form.parse(req)
    
    const uploadedFiles = []
    
    // Process uploaded files
    Object.keys(files).forEach(key => {
      const fileArray = Array.isArray(files[key]) ? files[key] : [files[key]]
      
      fileArray.forEach(file => {
        if (file && file.filepath) {
          const fileName = path.basename(file.filepath)
          const fileUrl = `/uploads/${fileName}`
          
          uploadedFiles.push({
            originalName: file.originalFilename,
            fileName,
            fileUrl,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedBy: user.email,
            uploadedAt: new Date().toISOString()
          })
        }
      })
    })

    res.status(200).json({
      message: 'تم رفع الملفات بنجاح',
      files: uploadedFiles
    })

  } catch (error) {
    console.error('Upload error:', error)
    if (error.name === 'JsonWebTokenError' || error.message === 'No token provided') {
      return res.status(401).json({ message: 'غير مخول' })
    }
    res.status(500).json({ message: 'حدث خطأ في رفع الملف' })
  }
}