import { useState, useEffect } from 'react'
import { Shield, Eye, UserCheck, AlertCircle, CheckCircle, Clock, QrCode } from 'lucide-react'
import Card from '../../ui/Card'
import Table from '../../ui/Table'
import Button from '../../ui/Button'
import Modal from '../../ui/Modal'
import Badge from '../../ui/Badge'
import QRCodeComponent from '../../ui/QRCode'

export default function SecurityDashboard({ permits, onRefresh }) {
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  const tabs = [
    { id: 'pending', label: 'المراجعة الأمنية', icon: Clock },
    { id: 'approved', label: 'المعتمد أمنياً', icon: CheckCircle },
    { id: 'active', label: 'العمل النشط', icon: UserCheck },
    { id: 'monitoring', label: 'المراقبة المباشرة', icon: Eye }
  ]

  // Filter permits based on active tab
  const getFilteredPermits = () => {
    const today = new Date().toISOString().split('T')[0]
    
    switch (activeTab) {
      case 'pending':
        return permits.filter(p => 
          p.approvals?.technical?.status === 'approved' && 
          !p.approvals?.security?.status
        )
      case 'approved':
        return permits.filter(p => 
          p.approvals?.security?.status === 'approved'
        )
      case 'active':
        return permits.filter(p => 
          p.status === 'approved' && 
          p.startDate <= today && 
          p.endDate >= today
        )
      case 'monitoring':
        return permits.filter(p => 
          p.status === 'approved' && 
          p.startDate === today
        )
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
                {count > 0 && (
                  <Badge variant={activeTab === tab.id ? "primary" : "secondary"} size="sm">
                    {count}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Quick Actions for Active Work */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="إحصائيات العمل النشط">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">إجمالي العمال</span>
                <span className="font-medium">
                  {getFilteredPermits().reduce((sum, p) => sum + p.workerCount, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">المتاجر النشطة</span>
                <span className="font-medium">{getFilteredPermits().length}</span>
              </div>
            </div>
          </Card>
          
          <Card title="تنبيهات أمنية">
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-green-600">لا توجد تنبيهات</p>
            </div>
          </Card>
          
          <Card title="إجراءات سريعة">
            <div className="space-y-2">
              <Button size="sm" className="w-full" variant="outline">
                جولة أمنية
              </Button>
              <Button size="sm" className="w-full" variant="outline">
                تقرير يومي
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Permits Table */}
      <Card>
        <SecurityPermitsTable 
          permits={getFilteredPermits()}
          onReview={(permit) => {
            setSelectedPermit(permit)
            setShowReviewModal(true)
          }}
          onShowQR={(permit) => {
            setSelectedPermit(permit)
            setShowQRModal(true)
          }}
          activeTab={activeTab}
        />
      </Card>

      {/* Review Modal */}
      {showReviewModal && selectedPermit && (
        <Modal
          title={`المراجعة الأمنية للتصريح ${selectedPermit.id}`}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedPermit(null)
          }}
          size="lg"
        >
          <SecurityReviewForm 
            permit={selectedPermit}
            onApproval={handleApproval}
            onCancel={() => {
              setShowReviewModal(false)
              setSelectedPermit(null)
            }}
          />
        </Modal>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedPermit && (
        <Modal
          title={`رمز QR للتصريح ${selectedPermit.id}`}
          onClose={() => {
            setShowQRModal(false)
            setSelectedPermit(null)
          }}
        >
          <div className="text-center space-y-4">
            <QRCodeComponent 
              value={JSON.stringify({
                permitId: selectedPermit.id,
                shopName: selectedPermit.shopName,
                workType: selectedPermit.workType,
                date: selectedPermit.startDate
              })}
              size={200}
            />
            <p className="text-sm text-gray-600">
              امسح هذا الرمز للتحقق من التصريح
            </p>
            <Button
              onClick={() => window.print()}
              className="btn-outline"
            >
              طباعة الرمز
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function SecurityPermitsTable({ permits, onReview, onShowQR, activeTab }) {
  const columns = [
    { key: 'id', label: 'رقم التصريح' },
    { key: 'shopName', label: 'المتجر' },
    { key: 'workType', label: 'نوع العمل' },
    { key: 'contractor', label: 'المقاول' },
    { key: 'workers', label: 'العمال' },
    { key: 'timeframe', label: 'الوقت' },
    { key: 'status', label: 'الحالة' },
    { key: 'actions', label: 'إجراءات' }
  ]

  const getStatusBadge = (permit) => {
    if (activeTab === 'pending') {
      return <Badge variant="warning">يتطلب مراجعة أمنية</Badge>
    } else if (activeTab === 'approved') {
      return <Badge variant="success">معتمد أمنياً</Badge>
    } else if (activeTab === 'active') {
      return <Badge variant="primary">عمل نشط</Badge>
    } else {
      const secStatus = permit.approvals?.security?.status
      if (!secStatus) return <Badge variant="warning">معلق</Badge>
      if (secStatus === 'approved') return <Badge variant="success">معتمد</Badge>
      if (secStatus === 'rejected') return <Badge variant="danger">مرفوض</Badge>
    }
  }

  const data = permits.map(permit => ({
    id: permit.id,
    shopName: permit.shopName,
    workType: permit.workType === 'heavy_work' ? 'عمل ثقيل' : 
              permit.workType === 'medium_work' ? 'عمل متوسط' : 'عمل خفيف',
    contractor: permit.contractorName,
    workers: (
      <div className="flex items-center gap-1">
        <UserCheck className="h-4 w-4 text-gray-400" />
        {permit.workerCount}
      </div>
    ),
    timeframe: `${permit.startTime} - ${permit.endTime}`,
    status: getStatusBadge(permit),
    actions: (
      <div className="flex items-center gap-2">
        {activeTab === 'pending' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReview(permit)}
          >
            <Shield className="h-4 w-4 ml-1" />
            مراجعة
          </Button>
        )}
        {(activeTab === 'active' || activeTab === 'approved') && permit.status === 'approved' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onShowQR(permit)}
          >
            <QrCode className="h-4 w-4 ml-1" />
            QR
          </Button>
        )}
      </div>
    )
  }))

  if (permits.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">لا توجد تصاريح في هذه الفئة</p>
      </div>
    )
  }

  return <Table columns={columns} data={data} />
}

function SecurityReviewForm({ permit, onApproval, onCancel }) {
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (action) => {
    setLoading(true)
    await onApproval(permit.id, action, comments)
    setLoading(false)
  }

  const isTechnicalApproved = permit.approvals?.technical?.status === 'approved'

  return (
    <div className="space-y-6">
      {/* Permit Security Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">التفاصيل الأمنية</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <span className="text-gray-500">الموقع:</span>
            <span className="font-medium mr-2">{permit.location}</span>
          </div>
          <div>
            <span className="text-gray-500">المقاول:</span>
            <span className="font-medium mr-2">{permit.contractorName}</span>
          </div>
          <div>
            <span className="text-gray-500">رقم الطوارئ:</span>
            <span className="font-medium mr-2">{permit.emergencyContact}</span>
          </div>
          <div>
            <span className="text-gray-500">عدد العمال:</span>
            <span className="font-medium mr-2">{permit.workerCount}</span>
          </div>
          <div>
            <span className="text-gray-500">الوقت:</span>
            <span className="font-medium mr-2">{permit.startTime} - {permit.endTime}</span>
          </div>
        </div>
      </div>

      {/* Technical Approval Status */}
      {isTechnicalApproved && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">تم الاعتماد الفني</span>
          </div>
          <p className="text-sm text-green-700">
            {permit.approvals.technical.comments || 'تم اعتماد التصريح فنياً'}
          </p>
        </div>
      )}

      {/* Security Checklist */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">قائمة المراجعة الأمنية</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <input type="checkbox" id="identity" className="rounded border-gray-300" defaultChecked />
            <label htmlFor="identity" className="mr-2 text-sm text-blue-800">
              التحقق من هوية المقاول والعمال
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="access" className="rounded border-gray-300" defaultChecked />
            <label htmlFor="access" className="mr-2 text-sm text-blue-800">
              تحديد مسارات الدخول والخروج
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="emergency" className="rounded border-gray-300" defaultChecked />
            <label htmlFor="emergency" className="mr-2 text-sm text-blue-800">
              خطة الطوارئ والإخلاء متوفرة
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="surveillance" className="rounded border-gray-300" defaultChecked />
            <label htmlFor="surveillance" className="mr-2 text-sm text-blue-800">
              تغطية كاميرات المراقبة مناسبة
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="coordination" className="rounded border-gray-300" defaultChecked />
            <label htmlFor="coordination" className="mr-2 text-sm text-blue-800">
              التنسيق مع إدارة المول
            </label>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="form-label">ملاحظات المراجعة الأمنية</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="input-field"
          rows={4}
          placeholder="أضف ملاحظاتك حول المراجعة الأمنية..."
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
          رفض أمنياً
        </Button>
        <Button
          variant="success"
          onClick={() => handleSubmit('approve')}
          disabled={loading}
        >
          {loading ? 'جاري الحفظ...' : 'اعتماد أمني'}
        </Button>
      </div>
    </div>
  )
}