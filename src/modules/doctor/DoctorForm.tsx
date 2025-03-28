'use client'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

import { useFormik } from 'formik'
import { Box, Button, Card, CardContent, InputAdornment, MenuItem } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import Form from '@components/form/Form'
import CustomTextField from '@core/components/mui/TextField'

import { doctorsService } from '@/apis/services/doctors'
import { specialitiesService } from '@/apis/services/specialities'
import { doctorValidationSchema } from '@/modules/doctor/utils/doctorValidationSchema'
import { createFilePreview, createMultiLanguageFormData } from '@components/form/formUtils'
import { MultiLanguageTextField } from '@components/form/MultiLanguageTextField'
import { ImageUploadField } from '@components/form/ImageUploadField'

// Constants
const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'Arabic' }
]

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
  name: LanguageValue[]
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
      try {
        const formData = createMultiLanguageFormData(values, ['name'])

        if (id) {
          formData.append('_method', 'patch')
          await doctorsService.updateDoctor(id, formData)
          toast.success('Doctor updated successfully')
        } else {
          await doctorsService.createDoctor(formData)
          toast.success('Doctor created successfully')
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'An unknown error occurred'

        toast.error(`Failed to ${id ? 'update' : 'create'} doctor: ${errorMessage}`)
      }
    }
  })

  // Handle image selection
  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]

    if (!file) return

    try {
      const previewUrl = await createFilePreview(file)

      setImagePreviewUrl(previewUrl)
      formik.setFieldValue('cover', file)
    } catch (error) {
      toast.error('Failed to process image')
    }
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
    // Ensure that the name field always contains at least the English and Arabic entries
    const nameArray =
      Array.isArray(doctorData.name) && doctorData.name.length > 0
        ? doctorData.name
        : [
            { langId: 'en', value: typeof doctorData.name === 'string' ? doctorData.name : '' },
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

  return (
    <Card>
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={6}>
            {/* Multilingual Name Field */}
            <Grid size={{ xs: 12 }}>
              <MultiLanguageTextField
                formik={formik}
                languages={LANGUAGES}
                name='name'
                onLanguageChange={updateNameField}
                placeholder='Your Name'
              />
            </Grid>

            {/* Speciality Dropdown */}
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
                    {speciality.name?.[0]?.value} - {speciality.name?.[1]?.value}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>

            {/* Other Text Fields */}
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
                type='number'
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

            {/* Image Upload Field */}
            <Grid size={{ xs: 12 }}>
              <ImageUploadField formik={formik} previewUrl={imagePreviewUrl} onImageChange={handleImageSelection} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Button fullWidth type='submit' variant='contained' color='primary' disabled={formik.isSubmitting}>
              {id ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default DoctorForm
