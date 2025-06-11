import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useData } from '../../../contexts/DataContext'
import { useTranslation } from 'react-i18next'
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import Table from '../../ui/Table'
import Badge from '../../ui/Badge'
import Modal from '../../ui/Modal'
import { formatDate, getStatusColor } from '../../../lib/utils'

export default function MyPermits() {
  const { user } = useAuth()
  const { permits } = useData()
  const { t } = useTranslation()
  const [myPermits, setMyPermits] = useState([])
  const [filteredPermits, setFilteredPermits] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPermit, setSelectedPermit] = useState(null)

  useEffect(() => {
    if (user && permits) {
      const shopPermits = permits.filter(p => p.shopId === user.shopId)
      setMyPermits(shopPermits)
      setFilteredPermits(shopPermits)
    }
  }, [user, permits])

  useEffect(() => {
    let filtered = myPermits

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(permit =>
        permit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.workDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(permit => permit.status === statusFilter)
    }

    setFilteredPermits(filtered)
  }, [myPermits, searchTerm, statusFilter])

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'error'
      case 'in_progress':
        return 'info'
      case 'completed':
        return 'default'
      default:
        return 'default'
    }
  }

  const tableColumns = [
    {
      key: 'id',
      label: 'رقم التصريح',
      render: (permit) => (
        <div className="font-medium text-gray-900">
          {permit.id}
        </div>
      )
    },
    {
      key: 'workDescription',
      label: 'وصف العمل',
      render: (permit) => (
        <div>
          <div className="font-medium text-gray-900">
            {permit.workDescription.length > 50
              ? `${permit.workDescription.substring(0, 50)}...`
              : permit.workDescription
            }
          </div>
          <div className="text-sm text-gray-500">
            {permit.location}
          </div>
        </div>
      )
    },
    {
      key: 'workType',
      label: 'نوع العمل',
      render: (permit) => (
        <Badge variant="secondary">
          {t(permit.workType)}
        </Badge>
      )
    },
    {
      key: 'startDate',
      label: 'تاريخ البداية',
      render: (permit) => (
        <div className="text-sm">
          {formatDate(permit.startDate)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (permit) => (
        <Badge variant={getStatusBadgeVariant(permit.status)}>
          {t(permit.status)}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (permit) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPermit(permit)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {permit.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {permit.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            تصاريحي
          </h2>
          <p className="text-gray-600 mt-1">
            جميع طلبات التصاريح الخاصة بمتجرك
          </p>
        </div>
        <Button icon={Plus}>
          تصريح جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {myPermits.length}
            </div>
            <div className="text-sm text-gray-600">إجمالي التصاريح</div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {myPermits.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">في الانتظار</div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {myPermits.filter(p => p.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">معتمدة</div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {myPermits.filter(p => p.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-600">قيد التنفيذ</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="البحث في التصاريح..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="approved">معتمدة</option>
            <option value="rejected">مرفوضة</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتملة</option>
          </Select>
          
          <Button variant="outline" icon={Download}>
            تصدير البيانات
          </Button>
        </div>
      </Card>

      {/* Permits Table */}
      <Card>
        <Table
          columns={tableColumns}
          data={filteredPermits}
          emptyMessage="لا توجد تصاريح"
        />
      </Card>

      {/* Permit Details Modal */}
      {selectedPermit && (
        <Modal
          isOpen={!!selectedPermit}
          onClose={() => setSelectedPermit(null)}
          title={`تفاصيل التصريح ${selectedPermit.id}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Status and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">معلومات أساسية</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم التصريح:</span>
                    <span className="font-medium">{selectedPermit.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحالة:</span>
                    <Badge variant={getStatusBadgeVariant(selectedPermit.status)}>
                      {t(selectedPermit.status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">نوع العمل:</span>
                    <span className="font-medium">{t(selectedPermit.workType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ الإنشاء:</span>
                    <span className="font-medium">{formatDate(selectedPermit.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">التواريخ والأوقات</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ البداية:</span>
                    <span className="font-medium">{formatDate(selectedPermit.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ الانتهاء:</span>
                    <span className="font-medium">{formatDate(selectedPermit.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">وقت البداية:</span>
                    <span className="font-medium">{selectedPermit.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">وقت الانتهاء:</span>
                    <span className="font-medium">{selectedPermit.endTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Description */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">وصف العمل</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{selectedPermit.workDescription}</p>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">موقع العمل</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{selectedPermit.location}</p>
              </div>
            </div>

            {/* Contractor Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">معلومات المقاول</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">اسم المقاول:</span>
                    <span className="font-medium">{selectedPermit.contractorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">عدد العمال:</span>
                    <span className="font-medium">{selectedPermit.workerCount}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">جهة الاتصال للطوارئ:</span>
                    <span className="font-medium">{selectedPermit.emergencyContact}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Status */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">حالة الموافقات</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">القسم الفني</span>
                  <Badge variant={getStatusBadgeVariant(selectedPermit.approvals?.technical?.status || 'pending')}>
                    {t(selectedPermit.approvals?.technical?.status || 'pending')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">الأمن</span>
                  <Badge variant={getStatusBadgeVariant(selectedPermit.approvals?.security?.status || 'pending')}>
                    {t(selectedPermit.approvals?.security?.status || 'pending')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">الإدارة</span>
                  <Badge variant={getStatusBadgeVariant(selectedPermit.approvals?.management?.status || 'pending')}>
                    {t(selectedPermit.approvals?.management?.status || 'pending')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setSelectedPermit(null)}>
                إغلاق
              </Button>
              <Button icon={Download}>
                تحميل PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}