'use client'
import { useEffect, useState } from 'react'

import { useFormik } from 'formik'
import { Box, Button, Card, CardContent, InputAdornment, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/form/Form'
import { hospitalsService } from '@/apis/services/hospitals'
import { hospitalValidationSchema } from '@/modules/hospital/utils/hospitalValidationSchema'
import { createFilePreview, createMultiLanguageFormData } from '@components/form/formUtils'
import { MultiLanguageTextField } from '@components/form/MultiLanguageTextField'
import { ImageUploadField } from '@components/form/ImageUploadField'

// Importing types and constants
import type { HospitalFormValues, HospitalFormProps } from '@/modules/hospital/entities/hospitalEntities'
import GoogleMapSelector from '@/modules/hospital/components/GoogleMapSelector'

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'Arabic' }
]

const initialHospitalFormValues: HospitalFormValues = {
  name: LANGUAGES.map(lang => ({ langId: lang.id, value: '' })),
  address: '',
  phone: '',
  email: '',
  type: null,
  lat: '',
  lng: '',
  cover: null
}

const HospitalForm = ({ id }: HospitalFormProps) => {
  const [showMap, setShowMap] = useState<boolean>(false)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)

  const hospitalFormik = useFormik<HospitalFormValues>({
    initialValues: initialHospitalFormValues,
    validationSchema: hospitalValidationSchema,
    onSubmit: async values => {
      await handleSubmitHospitalForm(values)
    }
  })

  const handleSubmitHospitalForm = async (values: HospitalFormValues) => {
    const formData = createMultiLanguageFormData(values, ['name'])

    formData.append('_method', 'PUT')

    try {
      if (id) {
        await updateExistingHospital(id, formData)
      } else {
        await createNewHospital(formData)
      }
    } catch (error: any) {
      handleHospitalApiError(error, id ? 'Update' : 'Create')
    }
  }

  const createNewHospital = async (formData: FormData): Promise<void> => {
    await hospitalsService.createHospital(formData)
    toast.success('Hospital Created successfully')
  }

  const updateExistingHospital = async (hospitalId: number, formData: FormData): Promise<void> => {
    await hospitalsService.updateHospital(hospitalId, formData)
    toast.success('Hospital Updated successfully')
  }

  const handleHospitalApiError = (error: any, action: string): void => {
    toast.error(`Failed to ${action} Hospital ${error.response?.data?.message || error.message}`)
  }

  useEffect(() => {
    if (id) {
      fetchHospitalData(id)
    }
  }, [id])

  const fetchHospitalData = async (hospitalId: number): Promise<void> => {
    try {
      const response = await hospitalsService.getHospital(hospitalId)
      const hospital = response.data.hospital

      populateFormWithHospitalData(hospital)
    } catch (error: any) {
      toast.error(`Failed to fetch Hospital ${error.response?.data?.message || error.message}`)
    }
  }

  const populateFormWithHospitalData = (hospital: any): void => {
    const nameArray = LANGUAGES.map(lang => {
      const nameEntry = hospital.name.find((n: { langId: string }) => n.langId === lang.id)

      return {
        langId: lang.id,
        value: nameEntry ? nameEntry.value : ''
      }
    })

    hospitalFormik.setValues(
      {
        name: nameArray,
        address: hospital.address,
        phone: hospital.phone,
        email: hospital.email,
        type: hospital.type === 'Public' ? 1 : 2,
        lat: hospital.lat,
        lng: hospital.lng,
        cover: hospital.cover
      },
      true
    )

    setCoverPreviewUrl(hospital.cover)
  }

  const handleNameTranslationChange = (langId: string, value: string): void => {
    const nameArray = [...hospitalFormik.values.name]
    const langIndex = nameArray.findIndex(item => item.langId === langId)

    if (langIndex !== -1) {
      nameArray[langIndex].value = value
      hospitalFormik.setFieldValue('name', nameArray)
    }
  }

  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]

    if (file) {
      const previewUrl = await createFilePreview(file)

      hospitalFormik.setFieldValue('cover', file)
      setCoverPreviewUrl(previewUrl)
    }
  }

  // Callback for location changes coming from the GoogleMapSelector component
  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    hospitalFormik.setFieldValue('lat', lat)
    hospitalFormik.setFieldValue('lng', lng)

    if (address) {
      hospitalFormik.setFieldValue('address', address)
    }
  }

  return (
    <Card>
      <CardContent>
        <Form onSubmit={hospitalFormik.handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <MultiLanguageTextField
                formik={hospitalFormik}
                languages={LANGUAGES}
                name='name'
                onLanguageChange={handleNameTranslationChange}
                placeholder='Hospital Name'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                name='address'
                label='Address'
                placeholder='Address 2'
                value={hospitalFormik.values.address}
                onChange={hospitalFormik.handleChange}
                onBlur={hospitalFormik.handleBlur}
                error={hospitalFormik.touched.address && Boolean(hospitalFormik.errors.address)}
                helperText={hospitalFormik.touched.address && hospitalFormik.errors.address}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-map-pin' />
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                name='phone'
                label='Phone'
                placeholder='+201201976741'
                value={hospitalFormik.values.phone}
                onChange={hospitalFormik.handleChange}
                onBlur={hospitalFormik.handleBlur}
                error={hospitalFormik.touched.phone && Boolean(hospitalFormik.errors.phone)}
                helperText={hospitalFormik.touched.phone && hospitalFormik.errors.phone}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-phone' />
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                name='email'
                type='email'
                label='Email'
                placeholder='hospital@example.com'
                value={hospitalFormik.values.email}
                onChange={hospitalFormik.handleChange}
                onBlur={hospitalFormik.handleBlur}
                error={hospitalFormik.touched.email && Boolean(hospitalFormik.errors.email)}
                helperText={hospitalFormik.touched.email && hospitalFormik.errors.email}
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
                select
                fullWidth
                name='type'
                label='Type'
                value={hospitalFormik.values.type}
                onChange={hospitalFormik.handleChange}
                onBlur={hospitalFormik.handleBlur}
                error={hospitalFormik.touched.type && Boolean(hospitalFormik.errors.type)}
                helperText={hospitalFormik.touched.type && hospitalFormik.errors.type}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-category' />
                      </InputAdornment>
                    )
                  }
                }}
              >
                <MenuItem value={1}>Public</MenuItem>
                <MenuItem value={2}>Private</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle1' fontWeight='medium' sx={{ mb: 1 }}>
                  Hospital Location
                </Typography>
                <Button
                  variant='outlined'
                  color='primary'
                  startIcon={<i className='tabler-map' />}
                  onClick={() => setShowMap(!showMap)}
                  sx={{ mb: 2 }}
                >
                  {showMap ? 'Hide Map' : 'Show Map to Select Location'}
                </Button>

                {showMap && (
                  <Box sx={{ mb: 3 }}>
                    <GoogleMapSelector
                      initialLat={hospitalFormik.values.lat ? parseFloat(String(hospitalFormik.values.lat)) : 30.0444}
                      initialLng={hospitalFormik.values.lng ? parseFloat(String(hospitalFormik.values.lng)) : 31.2357}
                      onLocationChange={handleLocationChange}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                name='lat'
                label='Latitude'
                placeholder='10.000'
                value={hospitalFormik.values.lat}
                onChange={hospitalFormik.handleChange}
                onBlur={hospitalFormik.handleBlur}
                error={hospitalFormik.touched.lat && Boolean(hospitalFormik.errors.lat)}
                helperText={hospitalFormik.touched.lat && hospitalFormik.errors.lat}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-map-2' />
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                name='lng'
                label='Longitude'
                placeholder='10.0000'
                value={hospitalFormik.values.lng}
                onChange={hospitalFormik.handleChange}
                onBlur={hospitalFormik.handleBlur}
                error={hospitalFormik.touched.lng && Boolean(hospitalFormik.errors.lng)}
                helperText={hospitalFormik.touched.lng && hospitalFormik.errors.lng}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-map-2' />
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ImageUploadField
                formik={hospitalFormik}
                previewUrl={coverPreviewUrl}
                onImageChange={handleCoverImageChange}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Button fullWidth type='submit' variant='contained' color='primary' disabled={hospitalFormik.isSubmitting}>
              {id ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default HospitalForm
