'use client'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, Button, Card, CardContent, InputAdornment, Typography, Grid } from '@mui/material'
import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'
import { doctorsService } from '@/apis/services/doctors'
import { specialitiesService } from '@/apis/services/specialities'
import ImageUpload from '@/components/ImageUpload'
import MultiLangTextFields from '@/components/MultiLangTextFields'
import { appendMultilingualFields, appendOtherFields } from '@/utils/formHelpers'

interface LanguageValue {
  langId: string
  value: string
}

export interface DoctorFormValues {
  name: LanguageValue[]
  speciality_id: string | number
  bio: string
  experience: string | number
  description: string
  email: string
  consultation_fee: string | number
  status: string | number
  cover: File | string | null
  rating: string | number
}

interface Speciality {
  id: number
  name: string
}

interface DoctorFormProps {
  id?: number
}

interface DoctorData {
  name: string | LanguageValue[]
  speciality_id: number
  bio: string
  experience: number
  description: string
  email: string
  consultation_fee: number
  status: string | number
  cover: string
  rating: number
}

const doctorValidationSchema = Yup.object({
  name: Yup.array()
    .of(
      Yup.object({
        langId: Yup.string().required('Language ID is required'),
        value: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters')
      })
    )
    .required('Name is required'),
  speciality_id: Yup.number().required('Speciality is required'),
  bio: Yup.string().required('Bio is required').min(10, 'Bio must be at least 10 characters'),
  experience: Yup.number().required('Experience is required').min(1, 'Experience must be at least 1 year'),
  description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  email: Yup.string().required('Email is required').email('Please enter a valid email'),
  consultation_fee: Yup.number()
    .required('Consultation fee is required')
    .min(1, 'Consultation fee must be a positive number'),
  status: Yup.number().required('Status is required'),
  cover: Yup.mixed()
    .test('fileOrString', 'Cover image is required', function (value) {
      return value instanceof File || (typeof value === 'string' && value.length > 0)
    })
    .test('fileSize', 'File is too large', value => {
      if (value instanceof File) {
        return value.size <= 5000000
      }

      return true
    })
    .test('fileType', 'Unsupported file format', value => {
      if (value instanceof File) {
        return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)
      }

      return true
    }),
  rating: Yup.number()
    .required('Rating is required')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
})

const getInitialFormValues = (): DoctorFormValues => ({
  name: [
    { langId: 'en', value: '' },
    { langId: 'ar', value: '' }
  ],
  speciality_id: '',
  bio: '',
  experience: '',
  description: '',
  email: '',
  consultation_fee: '',
  status: '',
  cover: null,
  rating: ''
})

const DoctorForm = ({ id }: DoctorFormProps) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [availableSpecialities, setAvailableSpecialities] = useState<Speciality[]>([])

  const formik = useFormik<DoctorFormValues>({
    initialValues: getInitialFormValues(),
    validationSchema: doctorValidationSchema,
    onSubmit: async values => {
      const formData = new FormData()

      if (id) {
        formData.append('_method', 'patch')
      }

      appendMultilingualFields(formData, 'name', values.name)
      appendOtherFields(formData, values, ['name'])
      await submitDoctorData(formData, id)
    }
  })

  const submitDoctorData = async (formData: FormData, doctorId?: number): Promise<void> => {
    try {
      if (doctorId) {
        await doctorsService.updateDoctor(doctorId, formData)
        toast.success('Doctor updated successfully')
      } else {
        await doctorsService.createDoctor(formData)
        toast.success('Doctor created successfully')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unknown error occurred'

      toast.error(`Failed to ${doctorId ? 'update' : 'create'} doctor: ${errorMessage}`)
    }
  }

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]

    if (!file) return
    formik.setFieldValue('cover', file)
    const reader = new FileReader()

    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  const updateNameField = (language: string, value: string): void => {
    const updatedNames = [...formik.values.name]
    const languageIndex = updatedNames.findIndex(item => item.langId === language)

    if (languageIndex !== -1) {
      updatedNames[languageIndex].value = value
      formik.setFieldValue('name', updatedNames)
    }
  }

  const formatDoctorDataForForm = (doctorData: DoctorData): DoctorFormValues => {
    const nameArray = Array.isArray(doctorData.name)
      ? doctorData.name
      : [
          { langId: 'en', value: doctorData.name as string },
          { langId: 'ar', value: '' }
        ]

    return {
      name: nameArray,
      speciality_id: doctorData.speciality_id,
      bio: doctorData.bio,
      experience: doctorData.experience,
      description: doctorData.description,
      email: doctorData.email,
      consultation_fee: doctorData.consultation_fee,
      status: doctorData.status === 'Active' ? 1 : 0,
      cover: doctorData.cover,
      rating: doctorData.rating
    }
  }

  const fetchDoctorData = async (doctorId: number): Promise<void> => {
    try {
      const response = await doctorsService.getDoctor(doctorId)
      const doctorData = response.data.doctor

      setImagePreviewUrl(doctorData.cover)
      const formattedData = formatDoctorDataForForm(doctorData)

      formik.setValues(formattedData, true)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unknown error occurred'

      toast.error(`Failed to fetch doctor data: ${errorMessage}`)
    }
  }

  const fetchSpecialities = async (): Promise<void> => {
    try {
      const response = await specialitiesService.listSpecialities()

      setAvailableSpecialities(response.data.specialities)
    } catch (error: any) {
      toast.error('Failed to load specialities')
    }
  }

  useEffect(() => {
    fetchSpecialities()

    if (id) {
      fetchDoctorData(id)
    }
  }, [id])

  const languages = [
    { langId: 'en', label: 'Name (English)', placeholder: 'Your Name in English' },
    { langId: 'ar', label: 'Name (Arabic)', placeholder: 'Your Name in Arabic' }
  ]

  return (
    <Card>
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={6}>
            <MultiLangTextFields
              languages={languages}
              values={formik.values.name}
              onChange={updateNameField}
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
                {availableSpecialities.map((speciality: Speciality) => (
                  <option key={speciality.id} value={speciality.id}>
                    {speciality.name}
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
                onChange={handleImageSelection}
                imagePreviewUrl={imagePreviewUrl}
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
