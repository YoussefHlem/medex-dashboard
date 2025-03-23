'use client'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, Button, Card, CardContent, InputAdornment, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'
import { doctorsService } from '@/apis/services/doctors'
import { specialitiesService } from '@/apis/services/specialities'

// Type definitions
interface LanguageValue {
  langId: string
  value: string
}

interface DoctorFormValues {
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

// Validation schema
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
        return value.size <= 5000000 // 5MB
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

// Initial form values
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

  // Form setup
  const formik = useFormik<DoctorFormValues>({
    initialValues: getInitialFormValues(),
    validationSchema: doctorValidationSchema,
    onSubmit: async values => {
      const formData = prepareFormData(values, id)

      await submitDoctorData(formData, id)
    }
  })

  // Prepare form data for submission
  const prepareFormData = (values: DoctorFormValues, doctorId?: number): FormData => {
    const formData = new FormData()

    if (doctorId) {
      formData.append('_method', 'patch')
    }

    // Handle multilingual name fields
    values.name.forEach((nameObj, index) => {
      Object.keys(nameObj).forEach(key => {
        formData.append(`name[${index}][${key}]`, nameObj[key])
      })
    })

    // Handle other fields
    Object.keys(values).forEach(key => {
      if (key !== 'name' && values[key] !== null) {
        formData.append(key, values[key] as string)
      }
    })

    return formData
  }

  // Submit form data to API
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

  // Handle image selection
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

  // Update name field for a specific language
  const updateNameField = (language: string, value: string): void => {
    const updatedNames = [...formik.values.name]
    const languageIndex = updatedNames.findIndex(item => item.langId === language)

    if (languageIndex !== -1) {
      updatedNames[languageIndex].value = value
      formik.setFieldValue('name', updatedNames)
    }
  }

  // Format doctor data for form
  const formatDoctorDataForForm = (doctorData: DoctorData): DoctorFormValues => {
    // Convert name field to proper format
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

  // Fetch doctor data if editing
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

  // Fetch specialities for dropdown
  const fetchSpecialities = async (): Promise<void> => {
    try {
      const response = await specialitiesService.listSpecialities()

      setAvailableSpecialities(response.data.specialities)
    } catch (error: any) {
      toast.error('Failed to load specialities')
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchSpecialities()

    if (id) {
      fetchDoctorData(id)
    }
  }, [])

  // Render image upload section
  const renderImageUploadSection = (): JSX.Element => (
    <Grid>
      <input
        type='file'
        accept='image/*'
        id='cover-upload'
        name='cover'
        onChange={handleImageSelection}
        style={{ display: 'none' }}
      />
      <label htmlFor='cover-upload'>
        <Card
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: formik.touched.cover && formik.errors.cover ? 'error.main' : 'primary.main',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: formik.touched.cover && formik.errors.cover ? 'error.dark' : 'primary.dark',
              opacity: 0.8
            }
          }}
        >
          {imagePreviewUrl ? (
            <Box
              component='img'
              src={imagePreviewUrl}
              alt='Cover preview'
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <i className='tabler-upload' style={{ fontSize: '2rem', color: 'primary.main' }} />
              <Typography variant='body1' color='primary' sx={{ mt: 2 }}>
                Upload Cover Image
              </Typography>
              <Typography variant='caption' color='textSecondary'>
                Click to select an image (JPG, PNG, or GIF)
              </Typography>
            </Box>
          )}
        </Card>
      </label>
      {formik.touched.cover && formik.errors.cover && (
        <Typography color='error' variant='caption' sx={{ mt: 1, display: 'block' }}>
          {formik.errors.cover as string}
        </Typography>
      )}
    </Grid>
  )

  return (
    <Card>
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                name='name.0.value'
                label='Name (English)'
                placeholder='Your Name in English'
                value={formik.values.name[0].value}
                onChange={e => updateNameField('en', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && (formik.errors.name as string)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                name='name.1.value'
                label='Name (Arabic)'
                placeholder='Your Name in Arabic'
                value={formik.values.name[1].value}
                onChange={e => updateNameField('ar', e.target.value)}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
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
                  <MenuItem key={speciality.id} value={speciality.id}>
                    {speciality.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
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
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={0}>Inactive</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
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
            {renderImageUploadSection()}
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
