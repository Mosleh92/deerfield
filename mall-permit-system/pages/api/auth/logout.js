export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Clear the token cookie
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict')
  
  res.status(200).json({ 
    message: 'تم تسجيل الخروج بنجاح' 
  })
}