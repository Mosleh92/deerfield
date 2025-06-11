import { useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import PermitForm from '../../permits/PermitForm'
import Card from '../../ui/Card'
import { ArrowLeft, Info } from 'lucide-react'
import Button from '../../ui/Button'

export default function NewPermitRequest() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (permitData) => {
    setIsSubmitting(true)
    try {
      // The PermitForm component handles the actual submission
      setTimeout(() => {
        router.push('/dashboard/tenant?tab=permits')
      }, 1000)
    } catch (error) {
      console.error('Error submitting permit:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          icon={ArrowLeft}
        >
          رجوع
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            طلب تصريح عمل جديد
          </h2>
          <p className="text-gray-600 mt-1">
            املأ البيانات المطلوبة لإنشاء طلب تصريح عمل
          </p>
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">
              إرشادات مهمة قبل البدء
            </h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• تأكد من اختيار نوع العمل المناسب (خفيف، متوسط، ثقيل)</li>
              <li>• أعد جميع المستندات المطلوبة قبل البدء</li>
              <li>• للأعمال الثقيلة، شهادة التأمين مطلوبة</li>
              <li>• تأكد من صحة بيانات المقاول والعمال</li>
              <li>• حدد التواريخ والأوقات بدقة</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Form */}
      <PermitForm 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}