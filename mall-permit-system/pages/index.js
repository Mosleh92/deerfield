import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import LoginForm from '../components/auth/LoginForm'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { USER_ROLES } from '../lib/constants'

export default function Home() {
  const { user, loading } = useAuth()
  const { isRTL } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      // Redirect based on user role
      switch (user.role) {
        case USER_ROLES.ADMIN:
        case USER_ROLES.OPERATIONS:
          router.push('/dashboard/operations')
          break
        case USER_ROLES.TECHNICAL:
          router.push('/dashboard/technical')
          break
        case USER_ROLES.SECURITY:
          router.push('/dashboard/security')
          break
        case USER_ROLES.TENANT:
          router.push('/dashboard/tenant')
          break
        default:
          router.push('/dashboard')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex items-center justify-center">
        <LoadingSpinner size="xl" text="جاري التحميل..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 ${isRTL ? 'font-arabic' : 'font-english'}`}>
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex items-center justify-center">
      <LoadingSpinner size="xl" text="جاري التوجيه..." />
    </div>
  )
}