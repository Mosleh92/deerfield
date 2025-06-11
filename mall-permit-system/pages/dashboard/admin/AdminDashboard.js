import { useState, useEffect } from 'react'
import { Users, Building, FileText, Settings, Plus, MoreVertical } from 'lucide-react'
import Card from '../../ui/Card'
import Table from '../../ui/Table'
import Button from '../../ui/Button'
import Modal from '../../ui/Modal'

export default function AdminDashboard({ dashboardData, onRefresh }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showShopModal, setShowShopModal] = useState(false)

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: FileText },
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'shops', label: 'المتاجر', icon: Building },
    { id: 'settings', label: 'الإعدادات', icon: Settings }
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
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
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card title="النشاط الأخير">
            <div className="space-y-4">
              {dashboardData?.recentPermits?.slice(0, 5).map((permit) => (
                <div key={permit.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {permit.workDescription}
                    </p>
                    <p className="text-xs text-gray-500">
                      {permit.shopName} - {new Date(permit.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <span className={`status-badge status-${permit.status}`}>
                    {permit.status === 'pending' ? 'معلق' :
                     permit.status === 'approved' ? 'معتمد' :
                     permit.status === 'rejected' ? 'مرفوض' : permit.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* System Status */}
          <Card title="حالة النظام">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">معدل الاستجابة</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">المستخدمين النشطين</span>
                <span className="text-sm font-medium text-blue-600">
                  {dashboardData?.userStats?.active || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">التصاريح المعتمدة اليوم</span>
                <span className="text-sm font-medium text-purple-600">
                  {dashboardData?.recentPermits?.filter(p => p.status === 'approved').length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">آخر نسخة احتياطية</span>
                <span className="text-sm font-medium text-gray-600">
                  {new Date().toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">إدارة المستخدمين</h3>
            <Button onClick={() => setShowUserModal(true)} className="btn-primary">
              <Plus className="h-4 w-4 ml-2" />
              إضافة مستخدم
            </Button>
          </div>
          
          <Card>
            <UserManagementTable onRefresh={onRefresh} />
          </Card>
        </div>
      )}

      {activeTab === 'shops' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">إدارة المتاجر</h3>
            <Button onClick={() => setShowShopModal(true)} className="btn-primary">
              <Plus className="h-4 w-4 ml-2" />
              إضافة متجر
            </Button>
          </div>
          
          <Card>
            <ShopManagementTable onRefresh={onRefresh} />
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card title="إعدادات النظام">
            <SystemSettings />
          </Card>
        </div>
      )}

      {/* Modals */}
      {showUserModal && (
        <Modal
          title="إضافة مستخدم جديد"
          onClose={() => setShowUserModal(false)}
        >
          <UserForm onSuccess={() => {
            setShowUserModal(false)
            onRefresh()
          }} />
        </Modal>
      )}

      {showShopModal && (
        <Modal
          title="إضافة متجر جديد"
          onClose={() => setShowShopModal(false)}
        >
          <ShopForm onSuccess={() => {
            setShowShopModal(false)
            onRefresh()
          }} />
        </Modal>
      )}
    </div>
  )
}

// Sub-components
function UserManagementTable({ onRefresh }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'name', label: 'الاسم' },
    { key: 'email', label: 'البريد الإلكتروني' },
    { key: 'role', label: 'الدور' },
    { key: 'status', label: 'الحالة' },
    { key: 'actions', label: 'إجراءات' }
  ]

  const data = users.map(user => ({
    name: user.name,
    email: user.email,
    role: user.role === 'admin' ? 'مدير' :
          user.role === 'operations' ? 'عمليات' :
          user.role === 'technical' ? 'فني' :
          user.role === 'security' ? 'أمن' :
          user.role === 'tenant' ? 'مستأجر' : user.role,
    status: (
      <span className={`status-badge ${user.status === 'active' ? 'status-approved' : 'status-rejected'}`}>
        {user.status === 'active' ? 'نشط' : 'غير نشط'}
      </span>
    ),
    actions: (
      <button className="text-gray-400 hover:text-gray-600">
        <MoreVertical className="h-4 w-4" />
      </button>
    )
  }))

  if (loading) {
    return <div className="text-center py-4">جاري التحميل...</div>
  }

  return <Table columns={columns} data={data} />
}

function ShopManagementTable({ onRefresh }) {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShops()
  }, [])

  const loadShops = async () => {
    try {
      const response = await fetch('/api/shops')
      if (response.ok) {
        const data = await response.json()
        setShops(data.shops || [])
      }
    } catch (error) {
      console.error('Error loading shops:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'shopName', label: 'اسم المتجر' },
    { key: 'shopNumber', label: 'رقم المتجر' },
    { key: 'category', label: 'الفئة' },
    { key: 'contactName', label: 'اسم المسؤول' },
    { key: 'status', label: 'الحالة' },
    { key: 'actions', label: 'إجراءات' }
  ]

  const data = shops.map(shop => ({
    shopName: shop.shopName,
    shopNumber: shop.shopNumber,
    category: shop.category,
    contactName: shop.contactName,
    status: (
      <span className={`status-badge ${shop.status === 'active' ? 'status-approved' : 'status-rejected'}`}>
        {shop.status === 'active' ? 'نشط' : 'غير نشط'}
      </span>
    ),
    actions: (
      <button className="text-gray-400 hover:text-gray-600">
        <MoreVertical className="h-4 w-4" />
      </button>
    )
  }))

  if (loading) {
    return <div className="text-center py-4">جاري التحميل...</div>
  }

  return <Table columns={columns} data={data} />
}

function SystemSettings() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">اسم النظام</label>
          <input 
            type="text" 
            className="input-field" 
            defaultValue="نظام إدارة تصاريح المول" 
            readOnly
          />
        </div>
        <div>
          <label className="form-label">إصدار النظام</label>
          <input 
            type="text" 
            className="input-field" 
            defaultValue="1.0.0" 
            readOnly
          />
        </div>
        <div>
          <label className="form-label">البريد الإلكتروني للإدارة</label>
          <input 
            type="email" 
            className="input-field" 
            defaultValue="admin@mall.com" 
          />
        </div>
        <div>
          <label className="form-label">رقم الهاتف للطوارئ</label>
          <input 
            type="tel" 
            className="input-field" 
            defaultValue="+966501234567" 
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button className="btn-primary">حفظ الإعدادات</Button>
      </div>
    </div>
  )
}

function UserForm({ onSuccess }) {
  // This would be a comprehensive user creation form
  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600">نموذج إضافة مستخدم جديد</p>
      <Button onClick={onSuccess} className="btn-primary w-full">
        حفظ المستخدم
      </Button>
    </div>
  )
}

function ShopForm({ onSuccess }) {
  // This would be a comprehensive shop creation form
  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600">نموذج إضافة متجر جديد</p>
      <Button onClick={onSuccess} className="btn-primary w-full">
        حفظ المتجر
      </Button>
    </div>
  )
}