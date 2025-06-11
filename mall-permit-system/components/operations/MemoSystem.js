import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { memoSchema } from '../../lib/validations'
import { DEPARTMENTS } from '../../lib/constants'
import { 
  Send, 
  Users, 
  Building, 
  AlertTriangle,
  Eye,
  Trash2,
  Plus
} from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatDate, getRelativeTime } from '../../lib/utils'

export default function MemoSystem() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { shops } = useData()
  const { memos, sendMemo } = useNotifications()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMemo, setSelectedMemo] = useState(null)
  const [recipientType, setRecipientType] = useState('all_departments')
  const [specificRecipients, setSpecificRecipients] = useState([])

  const { 
    register, 
    handleSubmit, 
    reset,
    watch,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: yupResolver(memoSchema)
  })

  const watchedRecipientType = watch('recipientType')

  const handleSendMemo = async (data) => {
    try {
      let recipients = []
      
      switch (data.recipientType) {
        case 'all_departments':
          recipients = DEPARTMENTS.map(d => d.id)
          break
        case 'all_shops':
          recipients = shops.map(s => s.id)
          break
        case 'specific_users':
          recipients = specificRecipients
          break
        default:
          recipients = [data.recipientType]
      }

      const memoData = {
        ...data,
        recipients,
        from: user.email,
        fromName: user.name
      }

      sendMemo(memoData)
      
      reset()
      setSpecificRecipients([])
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error sending memo:', error)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'default'
      default:
        return 'default'
    }
  }

  const getPriorityIcon = (priority) => {
    if (priority === 'urgent' || priority === 'high') {
      return <AlertTriangle className="h-4 w-4" />
    }
    return null
  }

  const getRecipientDisplay = (memo) => {
    if (memo.recipients.includes('all_departments')) {
      return 'جميع الأقسام'
    }
    if (memo.recipients.includes('all_shops')) {
      return 'جميع المتاجر'
    }
    if (memo.recipients.length > 3) {
      return `${memo.recipients.length} مستلم`
    }
    return memo.recipients.join(', ')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('memo_system')}
          </h2>
          <p className="text-gray-600 mt-1">
            إرسال المذكرات والإشعارات للأقسام والمتاجر
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={Plus}
        >
          {t('send_memo')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المذكرات</p>
              <p className="text-2xl font-bold text-gray-900">{memos.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">مذكرات اليوم</p>
              <p className="text-2xl font-bold text-gray-900">
                {memos.filter(m => 
                  new Date(m.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">عاجلة</p>
              <p className="text-2xl font-bold text-gray-900">
                {memos.filter(m => m.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Memos List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            المذكرات المرسلة
          </h3>
          
          {memos.length > 0 ? (
            <div className="space-y-4">
              {memos.map((memo) => (
                <div key={memo.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {memo.subject}
                        </h4>
                        <Badge variant={getPriorityColor(memo.priority)}>
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(memo.priority)}
                            <span>{t(memo.priority)}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {memo.content.length > 100 
                          ? `${memo.content.substring(0, 100)}...` 
                          : memo.content
                        }
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>من: {memo.fromName}</span>
                        <span>إلى: {getRecipientDisplay(memo)}</span>
                        <span>{getRelativeTime(memo.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMemo(memo)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              لم يتم إرسال أي مذكرات بعد
            </div>
          )}
        </div>
      </Card>

      {/* Send Memo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          reset()
          setSpecificRecipients([])
        }}
        title={t('send_memo')}
        size="lg"
      >
        <form onSubmit={handleSubmit(handleSendMemo)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('memo_subject')}
              {...register('subject')}
              error={errors.subject?.message && t(errors.subject.message)}
              required
              placeholder="موضوع المذكرة"
            />
            
            <Select
              label={t('memo_priority')}
              {...register('priority')}
              error={errors.priority?.message && t(errors.priority.message)}
              required
            >
              <option value="">اختر الأولوية</option>
              <option value="low">منخفضة</option>
              <option value="medium">متوسطة</option>
              <option value="high">عالية</option>
              <option value="urgent">عاجل</option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('memo_content')} *
            </label>
            <textarea
              {...register('content')}
              rows={6}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="محتوى المذكرة..."
            />
            {errors.content && (
              <p className="text-sm text-red-600 mt-1">
                {t(errors.content.message)}
              </p>
            )}
          </div>
          
          <div>
            <Select
              label={t('recipients')}
              {...register('recipientType')}
              required
              onChange={(e) => setRecipientType(e.target.value)}
            >
              <option value="">اختر المستقبلين</option>
              <option value="all_departments">جميع الأقسام</option>
              <option value="all_shops">جميع المتاجر</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name_ar}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                reset()
                setSpecificRecipients([])
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              icon={Send}
            >
              {t('send_memo')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Memo Modal */}
      {selectedMemo && (
        <Modal
          isOpen={!!selectedMemo}
          onClose={() => setSelectedMemo(null)}
          title="تفاصيل المذكرة"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedMemo.subject}
                </h3>
                <Badge variant={getPriorityColor(selectedMemo.priority)}>
                  {t(selectedMemo.priority)}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                <span>من: {selectedMemo.fromName}</span> • 
                <span className="ml-2">{formatDate(selectedMemo.timestamp)}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">
                {selectedMemo.content}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">المستقبلون:</h4>
              <p className="text-sm text-gray-600">
                {getRecipientDisplay(selectedMemo)}
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setSelectedMemo(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}