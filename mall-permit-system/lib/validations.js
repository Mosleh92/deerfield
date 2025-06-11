import * as yup from 'yup'

// Common validations
export const emailSchema = yup
  .string()
  .email('invalid_email')
  .required('field_required')

export const passwordSchema = yup
  .string()
  .min(8, 'password_min_length')
  .required('field_required')

export const phoneSchema = yup
  .string()
  .matches(/^[\+]?[1-9][\d]{0,15}$/, 'invalid_phone')
  .required('field_required')

export const dateSchema = yup
  .date()
  .required('field_required')
  .typeError('invalid_date')

export const timeSchema = yup
  .string()
  .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'invalid_time')
  .required('field_required')

// Shop validation schema
export const shopSchema = yup.object({
  shopName: yup
    .string()
    .required('field_required')
    .min(2, 'shop_name_min_length')
    .max(100, 'shop_name_max_length'),
  
  shopNumber: yup
    .string()
    .required('field_required')
    .matches(/^[A-Z0-9-]+$/, 'invalid_shop_number'),
  
  category: yup
    .string()
    .required('field_required'),
  
  contactPerson: yup
    .string()
    .required('field_required')
    .min(2, 'name_min_length'),
  
  phoneNumber: phoneSchema,
  
  email: emailSchema.optional()
})

// User validation schema
export const userSchema = yup.object({
  name: yup
    .string()
    .required('field_required')
    .min(2, 'name_min_length')
    .max(100, 'name_max_length'),
  
  email: emailSchema,
  
  role: yup
    .string()
    .required('field_required')
    .oneOf(['admin', 'operations', 'technical', 'security', 'tenant'], 'invalid_role'),
  
  department: yup
    .string()
    .when('role', {
      is: (role) => !['admin', 'tenant'].includes(role),
      then: yup.string().required('field_required'),
      otherwise: yup.string().optional()
    }),
  
  phone: phoneSchema.optional()
})

// Permit validation schema
export const permitSchema = yup.object({
  workDescription: yup
    .string()
    .required('field_required')
    .min(10, 'description_min_length')
    .max(500, 'description_max_length'),
  
  workType: yup
    .string()
    .required('field_required')
    .oneOf(['light_work', 'medium_work', 'heavy_work'], 'invalid_work_type'),
  
  location: yup
    .string()
    .required('field_required')
    .min(5, 'location_min_length'),
  
  startDate: dateSchema,
  
  endDate: yup
    .date()
    .required('field_required')
    .typeError('invalid_date')
    .min(yup.ref('startDate'), 'end_date_after_start'),
  
  startTime: timeSchema,
  
  endTime: yup
    .string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'invalid_time')
    .required('field_required')
    .test('end-time-after-start', 'end_time_after_start', function(value) {
      const { startTime } = this.parent
      if (!startTime || !value) return true
      return value > startTime
    }),
  
  workerCount: yup
    .number()
    .required('field_required')
    .min(1, 'min_worker_count')
    .max(50, 'max_worker_count')
    .integer('worker_count_integer'),
  
  contractorName: yup
    .string()
    .required('field_required')
    .min(2, 'contractor_name_min_length'),
  
  contractorLicense: yup
    .string()
    .when('workType', {
      is: (type) => ['medium_work', 'heavy_work'].includes(type),
      then: yup.string().required('contractor_license_required'),
      otherwise: yup.string().optional()
    }),
  
  emergencyContact: phoneSchema,
  
  safetyOfficer: yup
    .string()
    .when('workType', {
      is: 'heavy_work',
      then: yup.string().required('safety_officer_required'),
      otherwise: yup.string().optional()
    })
})

// Document validation
export const documentSchema = yup.object({
  name: yup
    .string()
    .required('field_required'),
  
  type: yup
    .string()
    .required('field_required'),
  
  file: yup
    .mixed()
    .required('file_required')
    .test('fileSize', 'file_too_large', (value) => {
      if (!value) return true
      return value.size <= 5 * 1024 * 1024 // 5MB
    })
    .test('fileType', 'invalid_file_type', (value) => {
      if (!value) return true
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      return allowedTypes.includes(value.type)
    })
})

// Memo validation schema
export const memoSchema = yup.object({
  subject: yup
    .string()
    .required('field_required')
    .min(5, 'subject_min_length')
    .max(200, 'subject_max_length'),
  
  content: yup
    .string()
    .required('field_required')
    .min(10, 'content_min_length')
    .max(2000, 'content_max_length'),
  
  priority: yup
    .string()
    .required('field_required')
    .oneOf(['low', 'medium', 'high', 'urgent'], 'invalid_priority'),
  
  recipients: yup
    .array()
    .of(yup.string())
    .min(1, 'recipients_required')
})

// Login validation schema
export const loginSchema = yup.object({
  email: emailSchema,
  password: yup
    .string()
    .required('field_required')
})

// Change password schema
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('field_required'),
  
  newPassword: passwordSchema,
  
  confirmPassword: yup
    .string()
    .required('field_required')
    .oneOf([yup.ref('newPassword')], 'passwords_not_match')
})

// Search and filter schema
export const searchSchema = yup.object({
  searchTerm: yup
    .string()
    .max(100, 'search_term_max_length'),
  
  status: yup
    .string()
    .optional(),
  
  workType: yup
    .string()
    .optional(),
  
  dateFrom: yup
    .date()
    .optional()
    .typeError('invalid_date'),
  
  dateTo: yup
    .date()
    .optional()
    .typeError('invalid_date')
    .min(yup.ref('dateFrom'), 'date_to_after_from')
})

// Export validation functions
export const validateField = async (schema, field, value) => {
  try {
    await schema.validateAt(field, { [field]: value })
    return null
  } catch (error) {
    return error.message
  }
}

export const validateForm = async (schema, values) => {
  try {
    await schema.validate(values, { abortEarly: false })
    return { isValid: true, errors: {} }
  } catch (error) {
    const errors = {}
    error.inner.forEach(err => {
      errors[err.path] = err.message
    })
    return { isValid: false, errors }
  }
}
