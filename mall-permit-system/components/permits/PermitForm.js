import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Upload, 
  X, 
  Plus, 
  AlertTriangle, 
  FileText, 
  Clock,
  MapPin,
  Users,
  HardHat
} from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import TextArea from '../ui/TextArea'
import Button from '../ui/Button'
import FileUpload from '../ui/FileUpload'
import CheckboxGroup from '../ui/CheckboxGroup'

export default function PermitForm({ onSubmit, initialData = null }) {
  const { t } = useTranslation()
  const { isRTL } = useLanguage()
  const { user } = useAuth()
  const [workType, setWorkType] = useState('')
  const [workerCount, setWorkerCount] = useState(0)
  const [uploadedDocuments, setUploadedDocuments] = useState({})

  const { 
    register, 
    handleSubmit, 
    watch, 
    control,
    setValue,
    formState: { errors },
    reset 
  } = useForm({
    defaultValues: {
      workers: [],
      safetyMeasures: [],
      ...initialData
    }
  })

  const { fields: workerFields, append: addWorker, remove: removeWorker } = useFieldArray({
    control,
    name: "workers"
  })

  const watchedWorkType = watch('workType')
  const watchedWorkerCount = watch('workerCount')

  useEffect(() => {
    if (watchedWorkType) {
      setWorkType(watchedWorkType)
    }
  }, [watchedWorkType])

  useEffect(() => {
    const count = parseInt(watchedWorkerCount) || 0
    setWorkerCount(count)
    
    // Adjust worker fields based on count
    const currentWorkers = workerFields.length
    if (count > currentWorkers) {
      for (let i = currentWorkers; i < count; i++) {
        addWorker({
          name: '',
          idNumber: '',
          specialization: '',
          documents: []
        })
      }
    } else if (count < currentWorkers) {
      for (let i = currentWorkers - 1; i >= count; i--) {
        removeWorker(i)
      }
    }
  }, [watchedWorkerCount, workerFields.length, addWorker, removeWorker])

  const workTypes = [
    { 
      value: 'light', 
      label: t('light_work'),
      description: t('light_work_desc'),
      examples: t('light_work_examples'),
      insuranceRequired: false
    },
    { 
      value: 'medium', 
      label: t('medium_work'),
      description: t('medium_work_desc'),
      examples: t('medium_work_examples'),
      insuranceRequired: false
    },
    { 
      value: 'heavy', 
      label: t('heavy_work'),
      description: t('heavy_work_desc'),
      examples: t('heavy_work_examples'),
      insuranceRequired: true
    }
  ]

  const selectedWorkType = workTypes.find(type => type.value === workType)

  const safetyMeasures = [
    { id: 'ppe', label: t('personal_protective_equipment') },
    { id: 'barriers', label: t('safety_barriers') },
    { id: 'signage', label: t('warning_signage') },
    { id: 'ventilation', label: t('proper_ventilation') },
    { id: 'emergency', label: t('emergency_procedures') },
    { id: 'supervision', label: t('qualified_supervision') },
  ]

  const handleFormSubmit = (data) => {
    const permitData = {
      ...data,
      workType: selectedWorkType,
      submittedBy: user.email,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      documents: uploadedDocuments,
      permitId: `PTW-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    }

    onSubmit(permitData)
  }

  const handleDocumentUpload = (category, files) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [category]: files
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('new_permit_request')}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('complete_form_carefully')}
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-8">
          {/* Work Details Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
              {t('work_details')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label={t('work_type')}
                {...register('workType', { required: t('work_type_required') })}
                error={errors.workType?.message}
                options={workTypes.map(type => ({ value: type.value, label: type.label }))}
              />

              <Input
                label={t('work_location')}
                {...register('workLocation', { required: t('work_location_required') })}
                error={errors.workLocation?.message}
                placeholder={t('work_location_placeholder')}
                icon={MapPin}
              />
            </div>

            {selectedWorkType && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  {selectedWorkType.label}
                </h4>
                <p className="text-sm text-blue-800 mb-2">
                  {selectedWorkType.description}
                </p>
                <p className="text-xs text-blue-700">
                  <strong>{t('examples')}:</strong> {selectedWorkType.examples}
                </p>
                {selectedWorkType.insuranceRequired && (
                  <div className="mt-2 flex items-center text-yellow-800">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      {t('insurance_required_for_heavy_work')}
                    </span>
                  </div>
                )}
              </div>
            )}

            <TextArea
              label={t('work_description')}
              {...register('workDescription', { required: t('work_description_required') })}
              error={errors.workDescription?.message}
              placeholder={t('work_description_placeholder')}
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label={t('start_date')}
                type="date"
                {...register('startDate', { required: t('start_date_required') })}
                error={errors.startDate?.message}
                icon={Clock}
              />

              <Input
                label={t('start_time')}
                type="time"
                {...register('startTime', { required: t('start_time_required') })}
                error={errors.startTime?.message}
              />

              <Input
                label={t('duration_hours')}
                type="number"
                {...register('durationHours', { 
                  required: t('duration_required'),
                  min: { value: 1, message: t('duration_min_1') }
                })}
                error={errors.durationHours?.message}
                placeholder="8"
              />
            </div>
          </div>

          {/* Contractor & Workers Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
              {t('contractor_workers_info')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t('contractor_name')}
                {...register('contractorName', { required: t('contractor_name_required') })}
                error={errors.contractorName?.message}
              />

              <Input
                label={t('contractor_phone')}
                type="tel"
                {...register('contractorPhone', { required: t('contractor_phone_required') })}
                error={errors.contractorPhone?.message}
              />
            </div>

            <Input
              label={t('number_of_workers')}
              type="number"
              {...register('workerCount', { 
                required: t('worker_count_required'),
                min: { value: 1, message: t('worker_count_min_1') }
              })}
              error={errors.workerCount?.message}
              icon={Users}
            />

            {/* Worker Details */}
            {workerFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">
                    {t('worker')} {index + 1}
                  </h4>
                  {workerFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorker(index)}
                      icon={X}
                    >
                      {t('remove')}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t('worker_name')}
                    {...register(`workers.${index}.name`, { required: t('worker_name_required') })}
                    error={errors.workers?.[index]?.name?.message}
                  />

                  <Input
                    label={t('id_number')}
                    {...register(`workers.${index}.idNumber`, { required: t('id_number_required') })}
                    error={errors.workers?.[index]?.idNumber?.message}
                  />

                  <Input
                    label={t('specialization')}
                    {...register(`workers.${index}.specialization`)}
                    error={errors.workers?.[index]?.specialization?.message}
                  />
                </div>

                {/* Worker Documents Upload */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('worker_documents')}
                  </label>
                  <FileUpload
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onUpload={(files) => handleDocumentUpload(`worker_${index}`, files)}
                    description={t('upload_worker_documents_desc')}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Safety Measures Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <HardHat className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
              {t('safety_measures')}
            </h3>

            <CheckboxGroup
              label={t('required_safety_measures')}
              options={safetyMeasures}
              {...register('safetyMeasures', { required: t('safety_measures_required') })}
              error={errors.safetyMeasures?.message}
            />

            <TextArea
              label={t('additional_safety_notes')}
              {...register('additionalSafetyNotes')}
              placeholder={t('additional_safety_placeholder')}
              rows={3}
            />
          </div>

          {/* Document Upload Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Upload className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary-600`} />
              {t('required_documents')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('safety_training_certificates')}
                </label>
                <FileUpload
                  accept=".pdf"
                  multiple
                  onUpload={(files) => handleDocumentUpload('safety_training', files)}
                  description={t('upload_safety_training_desc')}
                />
              </div>

              {selectedWorkType?.insuranceRequired && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('insurance_certificate')} *
                  </label>
                  <FileUpload
                    accept=".pdf"
                    onUpload={(files) => handleDocumentUpload('insurance', files)}
                    description={t('upload_insurance_desc')}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('additional_documents')}
                </label>
                <FileUpload
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onUpload={(files) => handleDocumentUpload('additional', files)}
                  description={t('upload_additional_desc')}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('emergency_contact')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t('emergency_contact_name')}
                {...register('emergencyContactName', { required: t('emergency_contact_required') })}
                error={errors.emergencyContactName?.message}
              />

              <Input
                label={t('emergency_contact_phone')}
                type="tel"
                {...register('emergencyContactPhone', { required: t('emergency_phone_required') })}
                error={errors.emergencyContactPhone?.message}
              />
            </div>
          </div>

          {/* Submit Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-900">
                    {t('important_notice')}
                  </h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    {t('permit_submission_notice')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="secondary">
                {t('save_draft')}
              </Button>
              <Button type="submit">
                {t('submit_permit_request')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}