'use client'
import React, { useEffect, useState } from 'react'

import { useFormik } from 'formik'
import { Box, Button, Card, CardContent, Grid, InputAdornment } from '@mui/material'
import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'
import ImageUpload from '@/components/ImageUpload'
import MultiLangTextFields from '@/components/MultiLangTextFields'
import { doctorsService } from '@/apis/services/doctors'
import { specialitiesService } from '@/apis/services/specialities'
import { doctorValidationSchema, initialDoctorFormValues } from './DoctorFormValidation'
import { submitDoctorDataRequest, formatDoctorDataForForm } from './DoctorFormHelpers'

interface DoctorFormProps {
  id?: number
}

const DoctorForm = ({ id }: DoctorFormProps) => {
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [specialityOptions, setSpecialityOptions] = useState<any[]>([])

  const formik = useFormik({
    initialValues: initialDoctorFormValues,
    validationSchema: doctorValidationSchema,
    onSubmit: async values => {
      const formData = new FormData()

      if (id) formData.append('_method', 'patch')

      import('@/utils/formHelpers').then(({ appendMultilingualFields, appendOtherFields }) => {
        appendMultilingualFields(formData, 'name', values.name)
        appendOtherFields(formData, values, ['name'])
      })

      await submitDoctorDataRequest(formData, id)
    }
  })

  // Update the multilingual name for doctor.
  const updateDoctorNameTranslation = (languageCode: string, text: string): void => {
    const updatedNames = formik.values.name.map(nameItem =>
      nameItem.langId === languageCode ? { ...nameItem, value: text } : nameItem
    )

    formik.setFieldValue('name', updatedNames)
  }

  // Handle image selection and preview update.
  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]

    if (!file) return

    formik.setFieldValue('cover', file)
    const reader = new FileReader()

    reader.onloadend = () => setCoverPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Load specialities and, if editing, the doctor data.
  const loadSpecialityOptions = async (): Promise<void> => {
    try {
      const response = await specialitiesService.listSpecialities()

      setSpecialityOptions(response.data.specialities)
    } catch (error: any) {
      toast.error('Failed to load specialities')
    }
  }

  const loadDoctorData = async (doctorId: number): Promise<void> => {
    try {
      const response = await doctorsService.getDoctor(doctorId)
      const doctorData = response.data.doctor

      setCoverPreview(doctorData.cover)
      const formattedData = formatDoctorDataForForm(doctorData)

      formik.setValues(formattedData, true)
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'An unknown error occurred'

      toast.error(`Failed to fetch doctor data: ${errMsg}`)
    }
  }

  useEffect(() => {
    loadSpecialityOptions()
    if (id) loadDoctorData(id)
  }, [id])

  const languages = [
    {
      langId: 'en',
      label: 'Name (English)',
      placeholder: 'Your Name in English'
    },
    {
      langId: 'ar',
      label: 'Name (Arabic)',
      placeholder: 'Your Name in Arabic'
    }
  ]

  return (
    <Card>
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={6}>
            <MultiLangTextFields
              languages={languages}
              values={formik.values.name}
              onChange={updateDoctorNameTranslation}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && (formik.errors.name as string)}
            />
            <Grid item xs={12}>
              <CustomTextField
                select
                fullWidth
                name='speciality_id'
                label='Speciality'
                value={formik.values.speciality_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.speciality_id && Boolean(formik.errors.speciality_id)}
                helperText={formik.touched.speciality_id && (formik.errors.speciality_id as string)}
              >
                {specialityOptions.map(spec => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                name='bio'
                label='Bio'
                placeholder='Short biography'
                value={formik.values.bio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bio && Boolean(formik.errors.bio)}
                helperText={formik.touched.bio && formik.errors.bio}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                name='experience'
                label='Experience (years)'
                placeholder='Years of experience'
                value={formik.values.experience}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.experience && Boolean(formik.errors.experience)}
                helperText={formik.touched.experience && (formik.errors.experience as string)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                name='description'
                label='Description'
                placeholder='Detailed description'
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                name='email'
                type='email'
                label='Email'
                placeholder='doctor@example.com'
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-mail' />
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                name='consultation_fee'
                label='Consultation Fee'
                placeholder='e.g., 100.00'
                type='number'
                value={formik.values.consultation_fee}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.consultation_fee && Boolean(formik.errors.consultation_fee)}
                helperText={formik.touched.consultation_fee && (formik.errors.consultation_fee as string)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                select
                fullWidth
                name='status'
                label='Status'
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && (formik.errors.status as string)}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </CustomTextField>
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                name='rating'
                label='Rating'
                placeholder='e.g., 4.5'
                type='number'
                value={formik.values.rating}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.rating && Boolean(formik.errors.rating)}
                helperText={formik.touched.rating && (formik.errors.rating as string)}
              />
            </Grid>
            <Grid item xs={12}>
              <ImageUpload
                id='cover-upload'
                name='cover'
                onChange={handleCoverImageChange}
                imagePreviewUrl={coverPreview}
                touched={formik.touched.cover}
                error={formik.errors.cover as string}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Button
              fullWidth
              type='submit'
              variant='contained'
              color='primary'
              disabled={!formik.isValid || formik.isSubmitting}
            >
              {id ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default DoctorForm
