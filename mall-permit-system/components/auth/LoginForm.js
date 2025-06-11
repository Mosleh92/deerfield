import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTranslation } from 'react-i18next'
import { Building, Mail, Lock, Globe } from 'lucide-react'

export default function LoginForm() {
  const { login } = useAuth()
  const { toggleLanguage, currentLanguage, isRTL } = useLanguage()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      login()
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentLanguage === 'ar' ? 'نظام تصاريح المول' : 'Mall Permit System'}
            </h1>
            <p className="text-gray-600 text-sm">
              {currentLanguage === 'ar' ? 'إدارة تصاريح العمل العام' : 'General Permit to Work Management'}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Mail className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('login')}
                </>
              )}
            </button>
          </form>

          {/* Language Toggle */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              <Globe className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {currentLanguage === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          {/* Demo Accounts Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {currentLanguage === 'ar' ? 'حسابات تجريبية:' : 'Demo Accounts:'}
            </h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div>admin@mall.com - {currentLanguage === 'ar' ? 'إدارة النظام' : 'System Admin'}</div>
              <div>operations@mall.com - {currentLanguage === 'ar' ? 'إدارة العمليات' : 'Operations'}</div>
              <div>security@mall.com - {currentLanguage === 'ar' ? 'الأمن' : 'Security'}</div>
              <div>technical@mall.com - {currentLanguage === 'ar' ? 'الفني' : 'Technical'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}