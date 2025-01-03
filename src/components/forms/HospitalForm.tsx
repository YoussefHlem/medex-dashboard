'use client'
import { useEffect, useState } from 'react'

import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, Button, Card, CardContent, InputAdornment, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'

import { toast } from 'react-toastify'

import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'
import { hospitalsService } from '@/apis/services/hospitals'

const validationSchema = Yup.object({
  name: Yup.string().required('Hospital name is required').min(3, 'Name must be at least 3 characters'),
  address: Yup.string().required('Address is required').min(5, 'Address must be at least 5 characters'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[1-9]\d{10,14}$/, 'Please enter a valid phone number'),
  email: Yup.string().required('Email is required').email('Please enter a valid email'),
  type: Yup.number().required('Type is required').oneOf([1, 2], 'Please select a valid type'),
  lat: Yup.number()
    .required('Latitude is required')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: Yup.number()
    .required('Longitude is required')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  cover: Yup.mixed()
    .test('fileOrString', 'Cover image is required', function (value) {
      // Accept either a File object or a URL string
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
    })
})

const HospitalForm = ({ id }: { id?: number }) => {
  const formik = useFormik({
    initialValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      type: null,
      lat: '',
      lng: '',
      cover: null
    },
    validationSchema,
    onSubmit: async values => {
      const formData = new FormData()

      if (id) {
        formData.append('_method', 'patch')
      }

      Object.keys(values).forEach(key => {
        formData.append(key, values[key])
      })

      // Here you would typically send the formData to your API
      console.log('Form submitted:', Object.fromEntries(formData))

      const action = id
        ? await hospitalsService.updateHospital(id, formData)
        : await hospitalsService.createHospital(formData)

      action
        .then(() => {
          toast.success(`Hospital ${id ? 'Updated' : 'Created'} successfully`)
        })
        .catch(err => {
          toast.error(`Failed to ${id ? 'Update' : 'Create'} Hospital ${err.response.data.message}`)
        })
    }
  })

  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (id) {
      hospitalsService
        .getHospital(id)
        .then(item => {
          const hospital = item.data.hospital

          formik.setValues(
            {
              name: hospital.name,
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
          setPreviewUrl(hospital.cover)
        })
        .catch(err => {
          toast.error(`Failed to fetch Hospital ${err.response.data.message}`)
        })
    }
  }, [])

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      formik.setFieldValue('cover', file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }

      reader.readAsDataURL(file)
    }
  }

  return (
    <Card>
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                name='name'
                label='Name'
                placeholder='Hospital 1'
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-building-hospital' />
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                name='address'
                label='Address'
                placeholder='Address 2'
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
            <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                name='email'
                type='email'
                label='Email'
                placeholder='omerre@omer.co0'
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
                <MenuItem value={1}>Public</MenuItem>
                <MenuItem value={2}>Private</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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
            <Grid size={{ xs: 12, md: 6 }}>
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
            <Grid>
              <input
                type='file'
                accept='image/*'
                id='cover-upload'
                name='cover'
                onChange={handleImageChange}
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
                  {previewUrl ? (
                    <Box
                      component='img'
                      src={previewUrl}
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
                  {formik.errors.cover}
                </Typography>
              )}
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

export default HospitalForm
