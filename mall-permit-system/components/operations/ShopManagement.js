import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { useData } from '../../contexts/DataContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Key, 
  Mail, 
  Store,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical
} from 'lucide-react'
import { shopSchema } from '../../lib/validations'
import { SHOP_CATEGORIES } from '../../lib/constants'
import { generatePassword, generateShopEmail, formatDate } from '../../lib/utils'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Table from '../ui/Table'
import Badge from '../ui/Badge'
import Card from '../ui/Card'

export default function ShopManagement() {
  const { t } = useTranslation()
  const { isRTL } = useLanguage()
  const { shops, saveShops } = useData()
  const { addNotification } = useNotifications()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShop, setEditingShop] = useState(null)
  const [generatedCredentials, setGeneratedCredentials] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: yupResolver(shopSchema)
  })

  const handleCreateShop = async (data) => {
    try {
      const shopId = `shop_${Date.now()}`
      const email = generateShopEmail(data.shopName)
      const password = generatePassword()

      const newShop = {
        id: shopId,
        ...data,
        email,
        password,
        status: 'active',
        createdAt: new Date().toISOString(),
        permitCount: 0
      }

      const updatedShops = [...shops, newShop]
      saveShops(updatedShops)

      setGeneratedCredentials({
        email,
        password,
        shopName: data.shopName
      })

      addNotification({
        type: 'success',
        title: t('shop_created'),
        message: `تم إنشاء حساب متجر ${data.shopName} بنجاح`
      })

      reset()
      setIsModalOpen(false)
    } catch (error) {
      addNotification({
        type: 'error',
        title: t('error_occurred'),
        message: error.message
      })
    }
  }

  const handleEditShop = (shop) => {
    setEditingShop(shop)
    reset(shop)
    setIsModalOpen(true)
  }

  const handleUpdateShop = async (data) => {
    try {
      const updatedShops = shops.map(shop =>
        shop.id === editingShop.id
          ? { ...shop, ...data, updatedAt: new Date().toISOString() }
          : shop
      )
      saveShops(updatedShops)

      addNotification({
        type: 'success',
        title: t('shop_updated'),
        message: `تم تحديث بيانات متجر ${data.shopName} بنجاح`
      })

      setEditingShop(null)
      setIsModalOpen(false)
      reset()
    } catch (error) {
      addNotification({
        type: 'error',
        title: t('error_occurred'),
        message: error.message
      })
    }
  }

  const handleDeleteShop = async (shopId) => {
    if (!confirm(t('confirm_delete_shop'))) return

    try {
      const updatedShops = shops.filter(shop => shop.id !== shopId)
      saveShops(updatedShops)

      addNotification({
        type: 'success',
        title: t('shop_deleted'),
        message: 'تم حذف المتجر بنجاح'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: t('error_occurred'),
        message: error.message
      })
    }
  }

  const resetPassword = (shop) => {
    const newPassword = generatePassword()
    const updatedShops = shops.map(s =>
      s.id === shop.id
        ? { ...s, password: newPassword, passwordUpdatedAt: new Date().toISOString() }
        : s
    )
    saveShops(updatedShops)
    
    setGeneratedCredentials({
      email: shop.email,
      password: newPassword,
      shopName: shop.shopName
    })

    addNotification({
      type: 'success',
      title: t('password_reset'),
      message: `تم إعادة تعيين كلمة مرور ${shop.shopName}`
    })
  }

  // Filter shops
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.shopNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || shop.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || shop.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const tableColumns = [
    {
      key: 'shopNumber',
      label: t('shop_number'),
      render: (shop) => (
        <div className="font-medium text-gray-900">
          {shop.shopNumber}
        </div>
      )
    },
    {
      key: 'shopName',
      label: t('shop_name'),
      render: (shop) => (
        <div>
          <div className="font-medium text-gray-900">{shop.shopName}</div>
          <div className="text-sm text-gray-500">{shop.email}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: t('shop_category'),
      render: (shop) => {
        const category = SHOP_CATEGORIES.find(c => c.value === shop.category)
        return (
          <Badge variant="secondary">
            {category ? category.label_ar : shop.category}
          </Badge>
        )
      }
    },
    {
      key: 'contactPerson',
      label: t('contact_person'),
      render: (shop) => (
        <div>
          <div className="font-medium text-gray-900">{shop.contactPerson}</div>
          <div className="text-sm text-gray-500">{shop.phoneNumber}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: t('status'),
      render: (shop) => (
        <Badge 
          variant={shop.status === 'active' ? 'success' : 'secondary'}
        >
          {t(shop.status)}
        </Badge>
      )
    },
    {
      key: 'permitCount',
      label: t('permits'),
      render: (shop) => (
        <div className="text-center">
          <span className="font-medium">{shop.permitCount || 0}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: t('created_at'),
      render: (shop) => (
        <div className="text-sm text-gray-500">
          {formatDate(shop.createdAt)}
        </div>
      )
    },
    {
      key: 'actions',
      label: t('actions'),
      render: (shop) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditShop(shop)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetPassword(shop)}
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteShop(shop.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('shop_management')}
          </h2>
          <p className="text-gray-600 mt-1">
            إدارة حسابات المتاجر وبيانات الاتصال
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingShop(null)
            reset()
            setIsModalOpen(true)
          }}
          icon={Plus}
        >
          {t('create_shop_account')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المتاجر</p>
              <p className="text-2xl font-bold text-gray-900">{shops.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">المتاجر النشطة</p>
              <p className="text-2xl font-bold text-gray-900">
                {shops.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="suspended">معلق</option>
          </Select>
          
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">جميع الفئات</option>
            {SHOP_CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label_ar}
              </option>
            ))}
          </Select>
          
          <Button variant="outline" icon={Download}>
            تصدير البيانات
          </Button>
        </div>
      </Card>

      {/* Shops Table */}
      <Card>
        <Table
          columns={tableColumns}
          data={filteredShops}
          emptyMessage="لا توجد متاجر مسجلة"
        />
      </Card>

      {/* Shop Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingShop(null)
          reset()
        }}
        title={editingShop ? t('edit_shop') : t('create_shop_account')}
        size="lg"
      >
        <form onSubmit={handleSubmit(editingShop ? handleUpdateShop : handleCreateShop)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('shop_name')}
              {...register('shopName')}
              error={errors.shopName?.message && t(errors.shopName.message)}
              required
            />
            
            <Input
              label={t('shop_number')}
              {...register('shopNumber')}
              error={errors.shopNumber?.message && t(errors.shopNumber.message)}
              required
            />
            
            <Select
              label={t('shop_category')}
              {...register('category')}
              error={errors.category?.message && t(errors.category.message)}
              required
            >
              <option value="">اختر الفئة</option>
              {SHOP_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label_ar}
                </option>
              ))}
            </Select>
            
            <Input
              label={t('contact_person')}
              {...register('contactPerson')}
              error={errors.contactPerson?.message && t(errors.contactPerson.message)}
              required
            />
            
            <Input
              label={t('phone_number')}
              type="tel"
              {...register('phoneNumber')}
              error={errors.phoneNumber?.message && t(errors.phoneNumber.message)}
              required
            />
            
            {editingShop && (
              <Select
                label={t('shop_status')}
                {...register('status')}
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="suspended">معلق</option>
              </Select>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                setEditingShop(null)
                reset()
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
            >
              {editingShop ? t('update') : t('create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Credentials Modal */}
      <Modal
        isOpen={!!generatedCredentials}
        onClose={() => setGeneratedCredentials(null)}
        title="بيانات الدخول"
        size="default"
      >
        {generatedCredentials && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">
                تم إنشاء حساب {generatedCredentials.shopName} بنجاح
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">البريد الإلكتروني: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {generatedCredentials.email}
                  </code>
                </div>
                <div>
                  <span className="font-medium">كلمة المرور: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {generatedCredentials.password}
                  </code>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                يرجى حفظ هذه البيانات وإرسالها لصاحب المتجر. لن تظهر كلمة المرور مرة أخرى.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `البريد الإلكتروني: ${generatedCredentials.email}\nكلمة المرور: ${generatedCredentials.password}`
                  )
                }}
              >
                نسخ البيانات
              </Button>
              <Button onClick={() => setGeneratedCredentials(null)}>
                تم
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                setEditingShop(null)
                reset()
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
            >
              {editingShop ? t('update') : t('create')}
            </Button>
          </div>
  

      {/* Credentials Modal */}
      {generatedCredentials && (
        <Modal
          isOpen={!!generatedCredentials}
          onClose={() => setGeneratedCredentials(null)}
          title="بيانات الدخول الجديدة"
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">
                تم إنشاء حساب {generatedCredentials.shopName} بنجاح
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">البريد الإلكتروني:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded ml-2">
                    {generatedCredentials.email}
                  </code>
                </div>
                <div>
                  <span className="font-medium text-gray-700">كلمة المرور:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded ml-2">
                    {generatedCredentials.password}
                  </code>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ يرجى حفظ هذه البيانات وإرسالها للمتجر. لن تظهر مرة أخرى.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `البريد الإلكتروني: ${generatedCredentials.email}\nكلمة المرور: ${generatedCredentials.password}`
                  )
                  addNotification({
                    type: 'success',
                    message: 'تم نسخ البيانات'
                  })
                }}
              >
                نسخ البيانات
              </Button>
              <Button onClick={() => setGeneratedCredentials(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        </Modal>
      )}