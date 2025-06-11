import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { useLanguage } from '../../contexts/LanguageContext'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(({ 
  className, 
  label,
  error,
  required = false,
  children,
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
        <select
          className={cn(
            'block w-full rounded-md border-gray-300 shadow-sm',
            'focus:border-primary-500 focus:ring-primary-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            'appearance-none pr-8',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        
        <div className={cn(
          'absolute inset-y-0 flex items-center pointer-events-none',
          isRTL ? 'left-0 pl-3' : 'right-0 pr-3'
        )}>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
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

Select.displayName = 'Select'

export default Select