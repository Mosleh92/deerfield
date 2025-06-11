// App constants
export const APP_NAME = 'نظام إدارة تصاريح المول'
export const APP_VERSION = '1.0.0'
export const MALL_DOMAIN = 'mall.com'

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  OPERATIONS: 'operations',
  TECHNICAL: 'technical',
  SECURITY: 'security',
  TENANT: 'tenant',
  CONTRACTOR: 'contractor'
}

// Permit statuses
export const PERMIT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
}

// Approval status
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// Work types
export const WORK_TYPES = {
  LIGHT: 'light_work',
  MEDIUM: 'medium_work',
  HEAVY: 'heavy_work'
}

// Shop statuses
export const SHOP_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
}

// Shop categories
export const SHOP_CATEGORIES = [
  { value: 'fashion', label_ar: 'الأزياء والملابس', label_en: 'Fashion & Clothing' },
  { value: 'electronics', label_ar: 'الإلكترونيات', label_en: 'Electronics' },
  { value: 'food_beverage', label_ar: 'الطعام والمشروبات', label_en: 'Food & Beverage' },
  { value: 'beauty_cosmetics', label_ar: 'التجميل والعناية', label_en: 'Beauty & Cosmetics' },
  { value: 'home_lifestyle', label_ar: 'المنزل ونمط الحياة', label_en: 'Home & Lifestyle' },
  { value: 'sports_outdoors', label_ar: 'الرياضة والهواء الطلق', label_en: 'Sports & Outdoors' },
  { value: 'kids_toys', label_ar: 'الأطفال والألعاب', label_en: 'Kids & Toys' },
  { value: 'services', label_ar: 'الخدمات', label_en: 'Services' },
  { value: 'entertainment', label_ar: 'الترفيه', label_en: 'Entertainment' },
  { value: 'health_wellness', label_ar: 'الصحة والعافية', label_en: 'Health & Wellness' }
]

// Floor levels
export const FLOOR_LEVELS = [
  { value: 'basement', label_ar: 'الطابق السفلي', label_en: 'Basement' },
  { value: 'ground', label_ar: 'الطابق الأرضي', label_en: 'Ground Floor' },
  { value: 'first', label_ar: 'الطابق الأول', label_en: 'First Floor' },
  { value: 'second', label_ar: 'الطابق الثاني', label_en: 'Second Floor' },
  { value: 'third', label_ar: 'الطابق الثالث', label_en: 'Third Floor' },
  { value: 'fourth', label_ar: 'الطابق الرابع', label_en: 'Fourth Floor' },
  { value: 'rooftop', label_ar: 'السطح', label_en: 'Rooftop' }
]

// Document types
export const DOCUMENT_TYPES = [
  { value: 'worker_id', label_ar: 'هوية العامل', label_en: 'Worker ID', required: true },
  { value: 'insurance_certificate', label_ar: 'شهادة التأمين', label_en: 'Insurance Certificate', required: true, workTypes: ['heavy_work'] },
  { value: 'safety_training', label_ar: 'شهادة التدريب على السلامة', label_en: 'Safety Training Certificate', required: true },
  { value: 'method_statement', label_ar: 'بيان طريقة العمل', label_en: 'Method Statement', required: false },
  { value: 'risk_assessment', label_ar: 'تقييم المخاطر', label_en: 'Risk Assessment', required: false },
  { value: 'contractor_license', label_ar: 'رخصة المقاول', label_en: 'Contractor License', required: true, workTypes: ['medium_work', 'heavy_work'] },
  { value: 'other', label_ar: 'أخرى', label_en: 'Other', required: false }
]

// Work type details
export const WORK_TYPE_DETAILS = {
  light_work: {
    name_ar: 'أعمال خفيفة',
    name_en: 'Light Work',
    description_ar: 'أعمال بسيطة لا تتطلب معدات ثقيلة',
    description_en: 'Simple work that doesn\'t require heavy equipment',
    maxWorkers: 5,
    maxDuration: 8, // hours
    requiredDocuments: ['worker_id', 'safety_training'],
    color: 'green',
    examples_ar: ['تنظيف', 'أعمال طلاء بسيطة', 'تركيب لافتات صغيرة'],
    examples_en: ['Cleaning', 'Simple painting', 'Small signage installation']
  },
  medium_work: {
    name_ar: 'أعمال متوسطة',
    name_en: 'Medium Work',
    description_ar: 'أعمال تتطلب بعض المعدات والخبرة',
    description_en: 'Work requiring some equipment and expertise',
    maxWorkers: 15,
    maxDuration: 16, // hours
    requiredDocuments: ['worker_id', 'safety_training', 'contractor_license'],
    color: 'yellow',
    examples_ar: ['تركيب ديكورات', 'أعمال كهربائية بسيطة', 'صيانة التكييف'],
    examples_en: ['Decoration installation', 'Simple electrical work', 'HVAC maintenance']
  },
  heavy_work: {
    name_ar: 'أعمال ثقيلة',
    name_en: 'Heavy Work',
    description_ar: 'أعمال معقدة تتطلب معدات ثقيلة وخبرة عالية',
    description_en: 'Complex work requiring heavy equipment and high expertise',
    maxWorkers: 50,
    maxDuration: 48, // hours
    requiredDocuments: ['worker_id', 'safety_training', 'contractor_license', 'insurance_certificate'],
    color: 'red',
    examples_ar: ['تخريب وبناء', 'أعمال كهربائية معقدة', 'تركيب أنظمة كبيرة'],
    examples_en: ['Demolition and construction', 'Complex electrical work', 'Large system installation']
  }
}

// Departments
export const DEPARTMENTS = [
  { 
    id: 'operations', 
    name_ar: 'إدارة العمليات', 
    name_en: 'Operations Management',
    permissions: ['manage_shops', 'manage_users', 'approve_permits', 'send_memos'],
    color: 'blue'
  },
  { 
    id: 'technical', 
    name_ar: 'القسم الفني', 
    name_en: 'Technical Department',
    permissions: ['review_technical', 'manage_contractors', 'safety_inspection'],
    color: 'green'
  },
  { 
    id: 'security', 
    name_ar: 'قسم الأمن', 
    name_en: 'Security Department',
    permissions: ['security_review', 'access_control', 'scan_qr'],
    color: 'red'
  },
  { 
    id: 'admin', 
    name_ar: 'الإدارة العامة', 
    name_en: 'Administration',
    permissions: ['full_access'],
    color: 'purple'
  }
]

// Permissions
export const PERMISSIONS = {
  MANAGE_SHOPS: 'manage_shops',
  MANAGE_USERS: 'manage_users',
  APPROVE_PERMITS: 'approve_permits',
  SEND_MEMOS: 'send_memos',
  REVIEW_TECHNICAL: 'review_technical',
  MANAGE_CONTRACTORS: 'manage_contractors',
  SAFETY_INSPECTION: 'safety_inspection',
  SECURITY_REVIEW: 'security_review',
  ACCESS_CONTROL: 'access_control',
  SCAN_QR: 'scan_qr',
  FULL_ACCESS: 'full_access'
}

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  MEMO: 'memo'
}

// Memo priority
export const MEMO_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
}

// File upload settings
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  MAX_FILES: 10
}

// Time settings
export const TIME_SETTINGS = {
  BUSINESS_HOURS: {
    START: '08:00',
    END: '22:00'
  },
  TIMEZONE: 'Asia/Riyadh',
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm'
}

// Work hours
export const WORK_HOURS = {
  MALL_OPEN: '06:00',
  MALL_CLOSE: '00:00',
  RESTRICTED_START: '10:00',
  RESTRICTED_END: '22:00'
}

// QR Code settings
export const QR_SETTINGS = {
  SIZE: 200,
  ERROR_CORRECTION: 'M',
  MARGIN: 4,
  COLOR: {
    DARK: '#000000',
    LIGHT: '#FFFFFF'
  }
}

// Pagination settings
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
}

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  PERMITS: '/api/permits',
  SHOPS: '/api/shops',
  USERS: '/api/users',
  DOCUMENTS: '/api/documents',
  NOTIFICATIONS: '/api/notifications',
  REPORTS: '/api/reports'
}

// Local storage keys
export const STORAGE_KEYS = {
  LANGUAGE: 'language',
  THEME: 'theme',
  USER_PREFERENCES: 'userPreferences',
  PERMITS: 'mall_permits',
  SHOPS: 'mall_shops',
  USERS: 'mall_users',
  NOTIFICATIONS: 'mall_notifications',
  MEMOS: 'mall_memos'
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الشبكة',
  UNAUTHORIZED: 'غير مخول',
  FORBIDDEN: 'ممنوع',
  NOT_FOUND: 'غير موجود',
  SERVER_ERROR: 'خطأ في الخادم',
  VALIDATION_ERROR: 'خطأ في التحقق'
}

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'تم الإنشاء بنجاح',
  UPDATED: 'تم التحديث بنجاح',
  DELETED: 'تم الحذف بنجاح',
  APPROVED: 'تم الاعتماد بنجاح',
  REJECTED: 'تم الرفض بنجاح'
}

// Default export
export default {
  APP_NAME,
  APP_VERSION,
  MALL_DOMAIN,
  USER_ROLES,
  PERMIT_STATUS,
  APPROVAL_STATUS,
  WORK_TYPES,
  SHOP_STATUS,
  SHOP_CATEGORIES,
  FLOOR_LEVELS,
  DOCUMENT_TYPES,
  WORK_TYPE_DETAILS,
  DEPARTMENTS,
  PERMISSIONS,
  NOTIFICATION_TYPES,
  MEMO_PRIORITY,
  FILE_UPLOAD,
  TIME_SETTINGS,
  WORK_HOURS,
  QR_SETTINGS,
  PAGINATION,
  API_ENDPOINTS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
}