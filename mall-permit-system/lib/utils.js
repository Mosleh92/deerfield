import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date, locale = 'ar-SA') {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatTime(time) {
  if (!time) return ''
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDateTime(datetime, locale = 'ar-SA') {
  if (!datetime) return ''
  return new Date(datetime).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getRelativeTime(date, locale = 'ar') {
  if (!date) return ''
  
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)
  
  if (diffInSeconds < 60) {
    return locale === 'ar' ? 'الآن' : 'now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return locale === 'ar' ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes} minutes ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return locale === 'ar' ? `منذ ${diffInHours} ساعة` : `${diffInHours} hours ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return locale === 'ar' ? `منذ ${diffInDays} يوم` : `${diffInDays} days ago`
  }
  
  return formatDate(date, locale === 'ar' ? 'ar-SA' : 'en-US')
}

export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `${prefix}${timestamp}${random}`.toUpperCase()
}

export function generatePassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export function generateShopEmail(shopName, mallDomain = 'mall.com') {
  const cleanName = shopName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substr(0, 20)
  return `${cleanName}@${mallDomain}`
}

export function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
    expired: 'bg-red-100 text-red-700 border-red-200'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getWorkTypeColor(type) {
  const colors = {
    light_work: 'bg-green-100 text-green-800',
    medium_work: 'bg-yellow-100 text-yellow-800',
    heavy_work: 'bg-red-100 text-red-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePhone(phone) {
  const re = /^[\+]?[1-9][\d]{0,15}$/
  return re.test(phone.replace(/\s/g, ''))
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function downloadFile(data, filename, type = 'application/json') {
  const blob = new Blob([data], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function exportToCSV(data, filename) {
  if (!data.length) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(field => `"${row[field] || ''}"`).join(','))
  ].join('\n')
  
  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return Promise.resolve()
  }
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substr(0, 2)
}

export function truncateText(text, length = 100) {
  if (!text || text.length <= length) return text
  return text.substr(0, length) + '...'
}

export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

export function filterBySearch(array, searchTerm, fields) {
  if (!searchTerm) return array
  
  const term = searchTerm.toLowerCase()
  return array.filter(item =>
    fields.some(field => {
      const value = item[field]
      return value && value.toString().toLowerCase().includes(term)
    })
  )
}

export function isValidDate(date) {
  return date instanceof Date && !isNaN(date)
}

export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString()
}

export function getWorkingDays(startDate, endDate) {
  let count = 0
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 5 && dayOfWeek !== 6) { // Not Friday or Saturday
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return count
}
// ... الكود السابق

export const generateQRCodeData = (permit) => {
  return JSON.stringify({
    permitId: permit.id,
    shopId: permit.shopId,
    shopName: permit.shopName,
    workType: permit.workType,
    location: permit.location,
    startDate: permit.startDate,
    endDate: permit.endDate,
    status: permit.status,
    validationCode: generateValidationCode(permit.id)
  })
}

export const generateValidationCode = (permitId) => {
  // Generate a simple validation code based on permit ID
  const hash = permitId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return Math.abs(hash).toString(36).toUpperCase().substring(0, 6)
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const validateWorkHours = (startTime, endTime, workType) => {
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  
  // Handle overnight work
  if (end < start) {
    end.setDate(end.getDate() + 1)
  }
  
  const duration = (end - start) / (1000 * 60 * 60) // hours
  
  // Check against work type limits
  const maxDuration = WORK_TYPE_DETAILS[workType]?.maxDuration || 8
  
  return {
    isValid: duration <= maxDuration,
    duration,
    maxDuration
  }
}

export const calculateWorkDuration = (startDate, endDate, startTime, endTime) => {
  const start = new Date(`${startDate}T${startTime}:00`)
  const end = new Date(`${endDate}T${endTime}:00`)
  
  const diffTime = Math.abs(end - start)
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
  
  return diffHours
}

export const generatePermitPDF = async (permit) => {
  // This would integrate with a PDF generation library
  // For now, return a mock PDF URL
  return `/api/permits/${permit.id}/pdf`
}

export const sendEmailNotification = async (to, subject, content, type = 'info') => {
  // This would integrate with an email service
  console.log('Sending email:', { to, subject, content, type })
  return Promise.resolve()
}