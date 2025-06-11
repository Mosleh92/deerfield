import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'

export default function Unauthorized() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          غير مخول للوصول
        </h1>
        
        <p className="text-gray-600 mb-2">
          عذراً، ليس لديك الصلاحية للوصول إلى هذه الصفحة
        </p>
        
        {user && (
          <p className="text-sm text-gray-500 mb-8">
            أنت مسجل الدخول كـ: <span className="font-medium">{user.role}</span>
          </p>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            الذهاب للصفحة الرئيسية
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full btn-outline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            العودة للصفحة السابقة
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full btn-ghost text-red-600 hover:bg-red-50"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  )
}