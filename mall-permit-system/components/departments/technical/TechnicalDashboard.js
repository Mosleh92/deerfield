import { useState, useEffect } from 'react'
import { FileCheck, AlertTriangle, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import Card from '../../ui/Card'
import Table from '../../ui/Table'
import Button from '../../ui/Button'
import Modal from '../../ui/Modal'
import Badge from '../../ui/Badge'

export default function TechnicalDashboard({ permits, onRefresh }) {
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const tabs = [
    { id: 'pending', label: 'المراجعة المطلوبة', icon: Clock },
    { id: 'approved', label: 'المعتمد فنياً', icon: CheckCircle },
    { id: 'rejected', label: 'المرفوض فنياً', icon: XCircle },
    { id: 'heavy_work', label: 'الأعمال الثقيلة', icon: AlertTriangle }
  ]

  // Filter permits based on active tab
  const getFilteredPermits = () => {
    switch (activeTab) {
      case 'pending':
        return permits.filter(p => 
          p.status === 'pending' && !p.approvals?.technical?.status
        )
      case 'approved':
        return permits.filter(p => 
          p.approvals?.technical?.status === 'approved'
        )
      case 'rejected':
        return permits.filter(p => 
          p.approvals?.technical?.status === 'rejected'
        )
      case 'heavy_work':
        return permits.filter(p => p.workType === 'heavy_work')
      default:
        return permits
    }
  }

  const handleApproval = async (permitId, action, comments = '') => {
    try {
      const response = await fetch(`/api/permits/${permitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          comments
        })
      })

      if (response.ok) {
        onRefresh()
        setShowReviewModal(false)
        setSelectedPermit(null)
      }
    } catch (error) {
      console.error('Error updating permit:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const count = getFilteredPermits().length
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && count > 0 && (
                  <Badge variant="primary" size="sm">{count}</Badge>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Permits Table */}
      <Card>
        <TechnicalPermitsTable 
          permits={getFilteredPermits()}
          onReview={(permit) => {
            setSelectedPermit(permit)
            setShowReviewModal(true)
          }}
          activeTab={activeTab}
        />
      </Card>

      {/* Review Modal */}
      {showReviewModal && selectedPermit && (
        <Modal
          title={`مراجعة التصريح ${selectedPermit.id}`}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedPermit(null)
          }}
          size="lg"
        >
          <TechnicalReviewForm 
            permit={selectedPermit}
            onApproval={handleApproval}
            onCancel={() => {
              setShowReviewModal(false)
              setSelectedPermit(null)
            }}
          />
        </Modal>
      )}
    </div>
  )
}

function TechnicalPermitsTable({ permits, onReview, activeTab }) {
  const columns = [
    { key: 'id', label: 'رقم التصريح' },
    { key: 'shopName', label: 'المتجر' },
    { key: 'workType', label: 'نوع العمل' },
    { key: 'workDescription', label: 'وصف العمل' },
    { key: 'date', label: 'تاريخ العمل' },
    { key: 'status', label: 'الحالة' },
    { key: 'actions', label: 'إجراءات' }
  ]

  const getWorkTypeLabel = (type) => {
    const types = {
      'light_work': 'عمل خفيف',
      'medium_work': 'عمل متوسط',
      'heavy_work': 'عمل ثقيل',
      'electrical': 'كهربائي',
      'plumbing': 'سباكة',
      'renovation': 'تجديد'
    }
    return types[type] || type
  }

  const getStatusBadge = (permit) => {
    if (activeTab === 'pending') {
      return <Badge variant="warning">يتطلب مراجعة فنية</Badge>
    } else if (activeTab === 'approved') {
      return <Badge variant="success">معتمد فنياً</Badge>
    } else if (activeTab === 'rejected') {
      return <Badge variant="danger">مرفوض فنياً</Badge>
    } else {
      const techStatus = permit.approvals?.technical?.status
      if (!techStatus) return <Badge variant="warning">معلق</Badge>
      if (techStatus === 'approved') return <Badge variant="success">معتمد</Badge>
      if (techStatus === 'rejected') return <Badge variant="danger">مرفوض</Badge>
    }
  }

  const data = permits.map(permit => ({
    id: permit.id,
    shopName: permit.shopName,
    workType: (
      <div className="flex items-center gap-2">
        {permit.workType === 'heavy_work' && (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        )}
        {getWorkTypeLabel(permit.workType)}
      </div>
    ),
    workDescription: (
      <div className="max-w-xs">
        <p className="text-sm text-gray-900 truncate" title={permit.workDescription}>
          {permit.workDescription}
        </p>
      </div>
    ),
    date: `${permit.startDate} إلى ${permit.endDate}`,
    status: getStatusBadge(permit),
    actions: (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onReview(permit)}
        >
          <Eye className="h-4 w-4 ml-1" />
          مراجعة
        </Button>
      </div>
    )
  }))

  if (permits.length === 0) {
    return (
      <div className="text-center py-8">
        <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">لا توجد تصاريح في هذه الفئة</p>
      </div>
    )
  }

  return <Table columns={columns} data={data} />
}

function TechnicalReviewForm({ permit, onApproval, onCancel }) {
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (action) => {
    setLoading(true)
    await onApproval(permit.id, action, comments)
    setLoading(false)
  }

  const requiresInsurance = permit.workType === 'heavy_work'
  const hasInsurance = permit.insuranceRequired

  return (
    <div className="space-y-6">
      {/* Permit Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">تفاصيل التصريح</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">رقم التصريح:</span>
            <span className="font-medium mr-2">{permit.id}</span>
          </div>
          <div>
            <span className="text-gray-500">المتجر:</span>
            <span className="font-medium mr-2">{permit.shopName}</span>
          </div>
          <div>
            <span className="text-gray-500">نوع العمل:</span>
            <span className="font-medium mr-2">
              {permit.workType === 'heavy_work' ? 'عمل ثقيل' : 
               permit.workType === 'medium_work' ? 'عمل متوسط' : 'عمل خفيف'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">التاريخ:</span>
            <span className="font-medium mr-2">{permit.startDate} - {permit.endDate}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">وصف العمل:</span>
            <p className="font-medium mt-1">{permit.workDescription}</p>
          </div>
          <div>
            <span className="text-gray-500">اسم المقاول:</span>
            <span className="font-medium mr-2">{permit.contractorName}</span>
          </div>
          <div>
            <span className="text-gray-500">عدد العمال:</span>
            <span className="font-medium mr-2">{permit.workerCount}</span>
          </div>
        </div>
      </div>

      {/* Technical Checklist */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">قائمة المراجعة الفنية</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <input type="checkbox" id="safety" className="rounded border-gray-300" defaultChecked />
            <label htmlFor="safety" className="mr-2 text-sm text-blue-800">
              إجراءات السلامة مناسبة لنوع العمل
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="equipment" className="rounded border-gray-300" defaultChecked />
            <label htmlFor="equipment" className="mr-2 text-sm text-blue-800">
              المعدات المطلوبة متوفرة ومناسبة
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="location" className="rounded border-gray-300" defaultChecked />
            <label htmlFor="location" className="mr-2 text-sm text-blue-800">
              الموقع مناسب وآمن للعمل
            </label>
          </div>
          {requiresInsurance && (
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="insurance" 
                className="rounded border-gray-300" 
                defaultChecked={hasInsurance}
                disabled={!hasInsurance}
              />
              <label htmlFor="insurance" className="mr-2 text-sm text-blue-800">
                <span className={hasInsurance ? 'text-green-600' : 'text-red-600'}>
                  التأمين ضد المخاطر مطلوب للأعمال الثقيلة
                  {hasInsurance ? ' ✓ متوفر' : ' ✗ غير متوفر'}
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="form-label">ملاحظات المراجعة الفنية</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="input-field"
          rows={4}
          placeholder="أضف ملاحظاتك حول المراجعة الفنية..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          إلغاء
        </Button>
        <Button
          variant="danger"
          onClick={() => handleSubmit('reject')}
          disabled={loading}
        >
          <XCircle className="h-4 w-4 ml-2" />
          رفض فنياً
        </Button>
        <Button
          variant="success"
          onClick={() => handleSubmit('approve')}
          disabled={loading || (requiresInsurance && !hasInsurance)}
        >
          <CheckCircle className="h-4 w-4 ml-2" />
          {loading ? 'جاري الحفظ...' : 'اعتماد فني'}
        </Button>
      </div>
    </div>
  )
}