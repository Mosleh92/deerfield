import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import { Building, Shield, Users, Wrench } from 'lucide-react'

export default function Login() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              نظام إدارة تصاريح المول
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              قم بتسجيل الدخول للوصول إلى النظام
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="h-full flex items-center justify-center p-12">
            <div className="max-w-lg text-white">
              <h3 className="text-2xl font-bold mb-8">
                نظام متكامل لإدارة تصاريح العمل
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-blue-200" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">أمان عالي</h4>
                    <p className="text-blue-100">
                      نظام مصادقة متعدد المستويات مع تحكم في الأدوار
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">إدارة شاملة</h4>
                    <p className="text-blue-100">
                      إدارة المتاجر والمقاولين والموظفين من مكان واحد
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Wrench className="h-8 w-8 text-blue-200" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">سير عمل ذكي</h4>
                    <p className="text-blue-100">
                      موافقات تلقائية ومتابعة مراحل التصاريح
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}