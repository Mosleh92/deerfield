import { useState, useEffect } from 'react'
import { FileText, Download, Filter, Calendar, Building } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Table from '../ui/Table'
import Input from '../ui/Input'
import Select from '../ui/Select'

export default function PermitReports() {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    shopId: '',
    status: '',
    workType: ''
  })

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        type: 'permits',
        ...filters
      }).toString()

      const response = await fetch(`/api/reports?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error loading report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const exportReport = async (format = 'csv') => {
    try {
      const queryParams = new URLSearchParams({
        type: 'permits',
        format,
        ...filters
      }).toString()

      const response = await fetch(`/api/reports?${queryParams}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `permits-report.${format}`
        link.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const workTypeOptions = [
    { value: '', label: 'جميع الأنواع' },
    { value: 'light_work', label: 'عمل خفيف' },
    { value: 'medium_work', label: 'عمل متوسط' },
    { value: 'heavy_work', label: 'عمل ثقيل' },
    { value: 'electrical', label: 'كهربائي' },
    { value: 'plumbing', label: 'سباكة' }
  ]

  const statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: 'pending', label: 'معلق' },
    { value: 'approved', label: 'معتمد' },
    { value: 'rejected', label: 'مرفوض' },
    { value: 'completed', label: 'مكتمل' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقرير التصاريح</h1>
            <p className="text-gray-600">تحليل شامل لتصاريح العمل</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => exportReport('csv')} variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button onClick={() => exportReport('pdf')} variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card title="فلاتر التقرير" icon={Filter}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="form-label">من تاريخ</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">إلى تاريخ</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">نوع العمل</label>
            <Select
              value={filters.workType}
              onChange={(e) => handleFilterChange('workType', e.target.value)}
              options={workTypeOptions}
            />
          </div>
          <div>
            <label className="form-label">الحالة</label>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={statusOptions}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={loadReport} className="w-full" disabled={loading}>
              {loading ? 'جاري التحميل...' : 'تطبيق الفلاتر'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{reportData.stats.total}</div>
              <div className="text-sm text-gray-600">إجمالي التصاريح</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{reportData.stats.pending}</div>
              <div className="text-sm text-gray-600">معلقة</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{reportData.stats.approved}</div>
              <div className="text-sm text-gray-600">معتمدة</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{reportData.stats.rejected}</div>
              <div className="text-sm text-gray-600">مرفوضة</div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts */}
      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="توزيع أنواع العمل">
            <WorkTypeChart data={reportData.workTypes} />
          </Card>
          <Card title="توزيع المتاجر">
            <ShopDistributionChart data={reportData.shopBreakdown} />
          </Card>
        </div>
      )}

      {/* Detailed Table */}
      {reportData && (
        <Card title="تفاصيل التصاريح">
          <PermitDetailsTable permits={reportData.permits} />
        </Card>
      )}
    </div>
  )
}

function WorkTypeChart({ data }) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0)
  
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([type, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0
        const typeLabel = type === 'light_work' ? 'عمل خفيف' :
                         type === 'medium_work' ? 'عمل متوسط' :
                         type === 'heavy_work' ? 'عمل ثقيل' : type
        
        return (
          <div key={type} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{typeLabel}</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{count}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ShopDistributionChart({ data }) {
  const sortedData = Object.entries(data)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10) // Top 10 shops
  
  return (
    <div className="space-y-3">
      {sortedData.map(([shopName, count]) => (
        <div key={shopName} className="flex items-center justify-between">
          <span className="text-sm text-gray-600 truncate flex-1" title={shopName}>
            {shopName}
          </span>
          <span className="text-sm font-medium ml-2">{count}</span>
        </div>
      ))}
    </div>
  )
}

function PermitDetailsTable({ permits }) {
  const columns = [
    { key: 'id', label: 'رقم التصريح' },
    { key: 'shopName', label: 'المتجر' },
    { key: 'workType', label: 'نوع العمل' },
    { key: 'startDate', label: 'تاريخ البداية' },
    { key: 'endDate', label: 'تاريخ النهاية' },
    { key: 'status', label: 'الحالة' }
  ]

  const data = permits.map(permit => ({
    id: permit.id,
    shopName: permit.shopName,
    workType: permit.workType === 'light_work' ? 'عمل خفيف' :
              permit.workType === 'medium_work' ? 'عمل متوسط' :
              permit.workType === 'heavy_work' ? 'عمل ثقيل' : permit.workType,
    startDate: permit.startDate,
    endDate: permit.endDate,
    status: (
      <span className={`status-badge status-${permit.status}`}>
        {permit.status === 'pending' ? 'معلق' :
         permit.status === 'approved' ? 'معتمد' :
         permit.status === 'rejected' ? 'مرفوض' : permit.status}
      </span>
    )
  }))

  return <Table columns={columns} data={data} />
}