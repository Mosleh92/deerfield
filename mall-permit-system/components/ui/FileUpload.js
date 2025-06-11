import { useState, useRef } from 'react'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatFileSize } from '../../lib/utils'
import Button from './Button'

export default function FileUpload({
  onUpload,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxSize = 5, // MB
  multiple = false,
  className,
  ...props
}) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    setUploadError('')
    
    Array.from(files).forEach(file => {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setUploadError(`حجم الملف يجب أن يكون أقل من ${maxSize}MB`)
        return
      }

      // Validate file type
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      if (!acceptedTypes.includes(fileExtension)) {
        setUploadError(`نوع الملف غير مدعوم. الأنواع المدعومة: ${acceptedTypes.join(', ')}`)
        return
      }

      // Call onUpload callback
      if (onUpload) {
        onUpload(file)
      }
    })
  }

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  return (
    <div className={cn('w-full', className)} {...props}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400',
          'cursor-pointer'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            اسحب الملفات هنا أو انقر للاختيار
          </p>
          <p className="text-xs text-gray-400">
            الحد الأقصى: {maxSize}MB | الأنواع المدعومة: {acceptedTypes.join(', ')}
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="mt-2 flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{uploadError}</span>
        </div>
      )}
    </div>
  )
}