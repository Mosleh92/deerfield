import { useRouter } from 'next/router'
import { Search, Home, ArrowLeft } from 'lucide-react'

export default function Custom404() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
            <Search className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          الصفحة غير موجودة
        </h2>
        
        <p className="text-gray-600 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/')}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            العودة للصفحة الرئيسية
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full btn-outline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    </div>
  )
}