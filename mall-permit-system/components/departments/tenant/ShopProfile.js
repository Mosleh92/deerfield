import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../../contexts/AuthContext'
import { useData } from '../../../contexts/DataContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { 
  Building, 
  Phone, 
  Mail, 
  User,
  MapPin,
  Edit,
  Save,
  X
} from 'lucide-react'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import Badge from '../../ui/Badge'

export default function ShopProfile() {
  const { user } = useAuth()
  const { shops, saveShops } = useData()
  const { addNotification } = useNotifications()
  const [isEditing, setIsEditing] = useState(false)
  const [shopData, setShopData] = useState(null)

  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm()

  useEffect(() => {
    if (user && shops) {
      const shop = shops.find(s => s.id === user.shopId)
      if (shop) {
        setShopData(shop)
        reset(shop)
      }
    }
  }, [user, shops, reset])

  const handleUpdateProfile = async (data) => {
    try {
      const updatedShops = shops.map(shop => 
        shop.id === user.shopId 
          ? { ...shop, ...data, updatedAt: new Date().toISOString() }
          : shop
      )
      
      saveShops(updatedShops)
      setShopData({ ...shopData, ...data })
      setIsEditing(false)
      
      addNotification({
        type: 'success',
        title: 'تم التحديث',
        message: 'تم تحديث بيانات المتجر بنجاح'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'حدث خطأ أثناء تحديث البيانات'
      })
    }
  }

  if (!shopData) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            ملف المتجر
          </h2>
          <p className="text-gray-600 mt-1">
            معلومات وبيانات المتجر الأساسية
          </p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              icon={Edit}
            >
              تعديل البيانات
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  reset(shopData)
                }}
                icon={X}
              >
                إلغاء
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Shop Info Card */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-primary-100 rounded-lg">
            <Building className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {shopData.shopName}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={shopData.status === 'active' ? 'success' : 'warning'}>
                {shopData.status === 'active' ? 'نشط' : 'غير نشط'}
              </Badge>
              <span className="text-sm text-gray-500">
                رقم المتجر: {shopData.shopNumber}
              </span>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="اسم المتجر"
                {...register('shopName', { required: 'اسم المتجر مطلوب' })}
                error={errors.shopName?.message}
                icon={Building}
              />
              
              <Input
                label="رقم المتجر"
                {...register('shopNumber', { required: 'رقم المتجر مطلوب' })}
                error={errors.shopNumber?.message}
                icon={MapPin}
              />
              
              <Select
                label="الفئة"
                {...register('category', { required: 'الفئة مطلوبة' })}
                error={errors.category?.message}
              >
                <option value="">اختر الفئة</option>
                <option value="clothing">ملابس</option>
                <option value="electronics">إلكترونيات</option>
                <option value="food">طعام ومشروبات</option>
                <option value="beauty">جمال وعناية</option>
                <option value="home">منزل ومفروشات</option>
                <option value="sports">رياضة ولياقة</option>
                <option value="books">كتب وقرطاسية</option>
                <option value="jewelry">مجوهرات وساعات</option>
                <option value="toys">ألعاب وأطفال</option>
                <option value="other">أخرى</option>
              </Select>
              
              <Input
                label="اسم المسؤول"
                {...register('contactName', { required: 'اسم المسؤول مطلوب' })}
                error={errors.contactName?.message}
                icon={User}
              />
              
              <Input
                label="رقم الهاتف"
                type="tel"
                {...register('contactPhone', { required: 'رقم الهاتف مطلوب' })}
                error={errors.contactPhone?.message}
                icon={Phone}
              />
              
              <Input
                label="البريد الإلكتروني"
                type="email"
                {...register('contactEmail', { required: 'البريد الإلكتروني مطلوب' })}
                error={errors.contactEmail?.message}
                icon={Mail}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف المتجر
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="وصف مختصر عن المتجر ونشاطه..."
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={isSubmitting}
                icon={Save}
              >
                حفظ التغييرات
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">اسم المتجر</div>
                  <div className="font-medium text-gray-900">{shopData.shopName}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">رقم المتجر</div>
                  <div className="font-medium text-gray-900">{shopData.shopNumber}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-gray-400 rounded-full"></div>
                <div>
                  <div className="text-sm text-gray-600">الفئة</div>
                  <div className="font-medium text-gray-900">{shopData.category}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">اسم المسؤول</div>
                  <div className="font-medium text-gray-900">{shopData.contactName}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">رقم الهاتف</div>
                  <div className="font-medium text-gray-900">{shopData.contactPhone}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">البريد الإلكتروني</div>
                  <div className="font-medium text-gray-900">{shopData.contactEmail}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {shopData.description && !isEditing && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">وصف المتجر</h4>
            <p className="text-gray-700">{shopData.description}</p>
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {shopData.permits?.length || 0}
            </div>
            <div className="text-sm text-gray-600">إجمالي التصاريح</div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {shopData.permits?.filter(p => p.status === 'approved').length || 0}
            </div>
            <div className="text-sm text-gray-600">تصاريح معتمدة</div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {shopData.permits?.filter(p => p.status === 'pending').length || 0}
            </div>
            <div className="text-sm text-gray-600">تصاريح معلقة</div>
          </div>
        </Card>
      </div>

      {/* Account Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          معلومات الحساب
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">تاريخ إنشاء الحساب:</span>
              <div className="font-medium text-gray-900">
                {new Date(shopData.createdAt).toLocaleDateString('ar-SA')}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-600">آخر تحديث:</span>
              <div className="font-medium text-gray-900">
                {new Date(shopData.updatedAt).toLocaleDateString('ar-SA')}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">معرف المتجر:</span>
              <div className="font-medium text-gray-900 font-mono">
                {shopData.id}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-600">البريد الإلكتروني للنظام:</span>
              <div className="font-medium text-gray-900">
                {shopData.systemEmail}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}