import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const DataContext = createContext()

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [permits, setPermits] = useState([])
  const [shops, setShops] = useState([])
  const [users, setUsers] = useState([])
  const [contractors, setContractors] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadPermits(),
        loadShops(),
        loadUsers(),
        loadContractors()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPermits = () => {
    const saved = localStorage.getItem('mall_permits')
    if (saved) {
      setPermits(JSON.parse(saved))
    } else {
      // Initialize with sample data
      const samplePermits = getSamplePermits()
      setPermits(samplePermits)
      localStorage.setItem('mall_permits', JSON.stringify(samplePermits))
    }
  }

  const loadShops = () => {
    const saved = localStorage.getItem('mall_shops')
    if (saved) {
      setShops(JSON.parse(saved))
    }
  }

  const loadUsers = () => {
    const saved = localStorage.getItem('mall_users')
    if (saved) {
      setUsers(JSON.parse(saved))
    }
  }

  const loadContractors = () => {
    const saved = localStorage.getItem('mall_contractors')
    if (saved) {
      setContractors(JSON.parse(saved))
    }
  }

  const savePermits = (updatedPermits) => {
    setPermits(updatedPermits)
    localStorage.setItem('mall_permits', JSON.stringify(updatedPermits))
  }

  const saveShops = (updatedShops) => {
    setShops(updatedShops)
    localStorage.setItem('mall_shops', JSON.stringify(updatedShops))
  }

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers)
    localStorage.setItem('mall_users', JSON.stringify(updatedUsers))
  }

  const saveContractors = (updatedContractors) => {
    setContractors(updatedContractors)
    localStorage.setItem('mall_contractors', JSON.stringify(updatedContractors))
  }

  const getSamplePermits = () => [
    {
      id: 'PTW-2024-001',
      shopId: 'shop-001',
      shopName: 'Fashion Store',
      workType: 'medium',
      workDescription: 'تركيب ديكورات جديدة للمتجر',
      location: 'الطابق الأول - متجر رقم 105',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      status: 'approved',
      contractorName: 'شركة التصميم المتقدم',
      workerCount: 3,
      createdAt: '2024-01-10T10:00:00Z',
      approvals: {
        technical: { status: 'approved', by: 'technical@mall.com', date: '2024-01-11T14:00:00Z' },
        security: { status: 'approved', by: 'security@mall.com', date: '2024-01-12T09:00:00Z' },
        management: { status: 'approved', by: 'operations@mall.com', date: '2024-01-12T16:00:00Z' }
      }
    },
    {
      id: 'PTW-2024-002',
      shopId: 'shop-002',
      shopName: 'Electronics Hub',
      workType: 'light',
      workDescription: 'صيانة نظام الإضاءة',
      location: 'الطابق الثاني - متجر رقم 201',
      startDate: '2024-01-20',
      endDate: '2024-01-20',
      status: 'pending',
      contractorName: 'شركة الصيانة السريعة',
      workerCount: 2,
      createdAt: '2024-01-18T08:00:00Z',
      approvals: {
        technical: { status: 'pending' },
        security: { status: 'pending' },
        management: { status: 'pending' }
      }
    }
  ]

  const value = {
    permits,
    shops,
    users,
    contractors,
    loading,
    savePermits,
    saveShops,
    saveUsers,
    saveContractors,
    loadData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}