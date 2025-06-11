import QRCode from 'qrcode'
import jwt from 'jsonwebtoken'
import { findPermitById } from '../../../lib/data'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

function verifyToken(req) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw new Error('No token provided')
  return jwt.verify(token, JWT_SECRET)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const user = verifyToken(req)
    const { permitId, format = 'png' } = req.query

    if (!permitId) {
      return res.status(400).json({ message: 'معرف التصريح مطلوب' })
    }

    // Verify permit exists
    const permit = findPermitById(permitId)
    if (!permit) {
      return res.status(404).json({ message: 'التصريح غير موجود' })
    }

    // Check permissions
    if (user.role === 'tenant' && permit.shopId !== user.shopId) {
      return res.status(403).json({ message: 'غير مخول لعرض هذا التصريح' })
    }

    // Only generate QR for approved permits
    if (permit.status !== 'approved') {
      return res.status(400).json({ message: 'يمكن إنشاء رمز QR للتصاريح المعتمدة فقط' })
    }

    // Create QR data
    const qrData = {
      permitId: permit.id,
      shopName: permit.shopName,
      workType: permit.workType,
      startDate: permit.startDate,
      endDate: permit.endDate,
      status: permit.status,
      verifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify/${permit.id}`
    }

    const qrString = JSON.stringify(qrData)

    if (format === 'svg') {
      const qrSvg = await QRCode.toString(qrString, {
        type: 'svg',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      res.setHeader('Content-Type', 'image/svg+xml')
      res.status(200).send(qrSvg)
    } else {
      const qrBuffer = await QRCode.toBuffer(qrString, {
        type: 'png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      res.setHeader('Content-Type', 'image/png')
      res.status(200).send(qrBuffer)
    }

  } catch (error) {
    console.error('QR generation error:', error)
    if (error.name === 'JsonWebTokenError' || error.message === 'No token provided') {
      return res.status(401).json({ message: 'غير مخول' })
    }
    res.status(500).json({ message: 'حدث خطأ في إنشاء رمز QR' })
  }
}