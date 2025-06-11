import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { useLanguage } from '../../contexts/LanguageContext'

const Input = forwardRef(({ 
  className, 
  type = 'text', 
  label,
  error,
  required = false,
  icon: Icon,
  iconPosition = 'left',
  ...props 
}, ref) => {
  const { isRTL } = useLanguage()

  return (
    <div className="space-y-2">
      {label && (
        <label className={cn(
          'block text-sm font-medium text-gray-700',
          isRTL ? 'text-right' : 'text-left'
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className={cn(
            'absolute inset-y-0 flex items-center pointer-events-none',
            isRTL ? 'right-0 pr-3' : 'left-0 pl-3'
          )}>
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <input
          type={type}
          className={cn(
            'block w-full rounded-md border-gray-300 shadow-sm',
            'focus:border-primary-500 focus:ring-primary-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            Icon && iconPosition === 'left' && (isRTL ? 'pr-10' : 'pl-10'),
            Icon && iconPosition === 'right' && (isRTL ? 'pl-10' : 'pr-10'),
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className={cn(
            'absolute inset-y-0 flex items-center pointer-events-none',
            isRTL ? 'left-0 pl-3' : 'right-0 pr-3'
          )}>
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p className={cn(
          'text-sm text-red-600',
          isRTL ? 'text-right' : 'text-left'
        )}>
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input