'use client'
import React, { useState } from 'react'

import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Box, Button, Card, CardContent, Grid, InputAdornment } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'
import ImageUpload from '@/components/ImageUpload'
import MultiLangTextFields from '@/components/MultiLangTextFields'
import { initialHospitalValues, hospitalValidationSchema } from './HospitalFormValidation'
import HospitalGoogleMap from './HospitalGoogleMap'
import { hospitalsService } from '@/apis/services/hospitals'
import { appendMultilingualFields, appendOtherFields } from '@/utils/formHelpers'

interface HospitalFormProps {
  id?: number
}

const HospitalForm = ({ id }: HospitalFormProps) => {
  const [mapVisible, setMapVisible] = useState(false)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)

  const formik = useFormik({
    initialValues: initialHospitalValues,
    validationSchema: hospitalValidationSchema,
    onSubmit: async values => {
      const formData = new FormData()

      if (id) formData.append('_method', 'patch')
      appendMultilingualFields(formData, 'name', values.name)
      appendOtherFields(formData, values, ['name'])

      try {
        if (id) {
          await hospitalsService.updateHospital(id, formData)
          toast.success('Hospital Updated successfully')
        } else {
          await hospitalsService.createHospital(formData)
          toast.success('Hospital Created successfully')
        }
      } catch (error: any) {
        toast.error(`Failed to ${id ? 'Update' : 'Create'} Hospital ${error.response?.data?.message || error.message}`)
      }
    }
  })

  // Handle cover image file change and preview generation.
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]

    if (!file) return

    formik.setFieldValue('cover', file)
    const reader = new FileReader()

    reader.onloadend = () => setCoverPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Update multilingual hospital name.
  const updateNameTranslation = (langId: string, value: string): void => {
    const updatedNames = formik.values.name.map(item => (item.langId === langId ? { ...item, value } : item))

    formik.setFieldValue('name', updatedNames)
  }

  // Toggle the visibility of the map component.
  const toggleMapDisplay = (): void => setMapVisible(prev => !prev)

  const languages = [
    {
      langId: 'en',
      label: 'Name (English)',
      placeholder: 'Hospital Name in English',
      icon: <i className='tabler-building-hospital' />
    },
    {
      langId: 'ar',
      label: 'Name (Arabic)',
      placeholder: 'Hospital Name in Arabic',
      icon: <i className='tabler-building-hospital' />
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
              onChange={updateNameTranslation}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && (formik.errors.name as string)}
            />
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                name='address'
                label='Address'
                placeholder='Address'
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
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
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                name='phone'
                label='Phone'
                placeholder='+201201976741'
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
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
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                name='email'
                type='email'
                label='Email'
                placeholder='hospital@example.com'
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
                select
                fullWidth
                name='type'
                label='Type'
                value={formik.values.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
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
                <option value={1}>Public</option>
                <option value={2}>Private</option>
              </CustomTextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                name='lat'
                label='Latitude'
                placeholder='10.000'
                value={formik.values.lat}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lat && Boolean(formik.errors.lat)}
                helperText={formik.touched.lat && formik.errors.lat}
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
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                name='lng'
                label='Longitude'
                placeholder='10.0000'
                value={formik.values.lng}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lng && Boolean(formik.errors.lng)}
                helperText={formik.touched.lng && formik.errors.lng}
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
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant='outlined'
                  color='primary'
                  startIcon={<i className='tabler-map' />}
                  onClick={toggleMapDisplay}
                  sx={{ mb: 2 }}
                >
                  {mapVisible ? 'Hide Map' : 'Show Map to Select Location'}
                </Button>
                {mapVisible && <HospitalGoogleMap formik={formik} />}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <ImageUpload
                id='cover-upload'
                name='cover'
                onChange={handleCoverChange}
                imagePreviewUrl={coverPreviewUrl}
                touched={formik.touched.cover}
                error={formik.errors.cover as string}
              />
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

export default HospitalForm
