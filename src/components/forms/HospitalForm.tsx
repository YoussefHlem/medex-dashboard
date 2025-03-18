'use client'
import { useEffect, useState, useRef } from 'react'

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
  name: Yup.array()
    .of(
      Yup.object().shape({
        langId: Yup.string().required('Language ID is required'),
        value: Yup.string().required('Name is required').min(3, 'Name must be at least 3 characters')
      })
    )
    .required('Hospital name is required'),
  address: Yup.string().required('Address is required').min(5, 'Address must be at least 5 characters'),
  phone: Yup.number().required('Phone number is required'),
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
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  const formik = useFormik({
    initialValues: {
      name: [
        { langId: 'en', value: '' },
        { langId: 'ar', value: '' }
      ],
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

      // Handle name array separately
      formData.append('name', JSON.stringify(values.name))

      // Append other form values
      Object.keys(values).forEach(key => {
        if (key !== 'name') {
          formData.append(key, values[key])
        }
      })

      // Here you would typically send the formData to your API
      console.log('Form submitted:', Object.fromEntries(formData))

      if (id) {
        await hospitalsService
          .updateHospital(id, formData)
          .then(() => {
            toast.success(`Hospital Updated successfully`)
          })
          .catch(err => {
            toast.error(`Failed to Update Hospital ${err.response.data.message}`)
          })
      } else {
        await hospitalsService
          .createHospital(formData)
          .then(() => {
            toast.success(`Hospital Created successfully`)
          })
          .catch(err => {
            toast.error(`Failed to Create Hospital ${err.response.data.message}`)
          })
      }
    }
  })

  const [previewUrl, setPreviewUrl] = useState(null)

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script')

      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    } else {
      setMapLoaded(true)
    }
  }, [])

  // Initialize map when component mounts and map script is loaded
  useEffect(() => {
    if (mapLoaded && showMap && mapRef.current) {
      const defaultLocation = {
        lat: formik.values.lat ? parseFloat(formik.values.lat) : 30.0444,
        lng: formik.values.lng ? parseFloat(formik.values.lng) : 31.2357
      }

      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 12,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false
      })

      const marker = new window.google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true
      })

      markerRef.current = marker

      // Update lat/lng when marker is dragged
      marker.addListener('dragend', () => {
        const position = marker.getPosition()
        const lat = position.lat()
        const lng = position.lng()

        formik.setFieldValue('lat', lat)
        formik.setFieldValue('lng', lng)
      })

      // Create search box for finding locations
      const input = document.getElementById('map-search-input')
      const searchBox = new window.google.maps.places.SearchBox(input)

      map.addListener('bounds_changed', () => {
        searchBox.setBounds(map.getBounds())
      })

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces()

        if (places.length === 0) return

        const place = places[0]

        if (!place.geometry || !place.geometry.location) return

        // Update marker and form values
        marker.setPosition(place.geometry.location)
        map.setCenter(place.geometry.location)

        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()

        formik.setFieldValue('lat', lat)
        formik.setFieldValue('lng', lng)

        // Optionally update address field with the found place's address
        if (place.formatted_address) {
          formik.setFieldValue('address', place.formatted_address)
        }
      })
    }
  }, [mapLoaded, showMap, mapRef.current])

  // Update marker position when lat/lng values change directly in the input fields
  useEffect(() => {
    if (mapLoaded && markerRef.current && formik.values.lat && formik.values.lng) {
      const position = {
        lat: parseFloat(formik.values.lat),
        lng: parseFloat(formik.values.lng)
      }

      markerRef.current.setPosition(position)
    }
  }, [formik.values.lat, formik.values.lng, mapLoaded])

  useEffect(() => {
    if (id) {
      hospitalsService
        .getHospital(id)
        .then(item => {
          const hospital = item.data.hospital

          // Convert existing name to multi-language format
          const nameValue = hospital.name || ''

          const nameArray = [
            { langId: 'en', value: nameValue },
            { langId: 'ar', value: '' }
          ]

          formik.setValues(
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

  // Handle name field change for specific language
  const handleNameChange = (langId, value) => {
    const nameArray = [...formik.values.name]
    const langIndex = nameArray.findIndex(item => item.langId === langId)

    if (langIndex !== -1) {
      nameArray[langIndex].value = value
      formik.setFieldValue('name', nameArray)
    }
  }

  return (
    <Card>
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle1' fontWeight='medium' sx={{ mb: 2 }}>
                Hospital Name
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    fullWidth
                    name='name-en'
                    label='Name (English)'
                    placeholder='Hospital 1'
                    value={formik.values.name.find(item => item.langId === 'en')?.value || ''}
                    onChange={e => handleNameChange('en', e.target.value)}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && typeof formik.errors.name === 'string' ? formik.errors.name : ''}
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
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    fullWidth
                    name='name-ar'
                    label='Name (Arabic)'
                    placeholder='المستشفى 1'
                    value={formik.values.name.find(item => item.langId === 'ar')?.value || ''}
                    onChange={e => handleNameChange('ar', e.target.value)}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && typeof formik.errors.name === 'string' ? formik.errors.name : ''}
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
              </Grid>
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
                    <CustomTextField
                      fullWidth
                      id='map-search-input'
                      placeholder='Search for a location...'
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='tabler-search' />
                          </InputAdornment>
                        )
                      }}
                    />
                    <Box
                      ref={mapRef}
                      sx={{
                        height: 400,
                        borderRadius: 1,
                        boxShadow: 3,
                        mb: 2
                      }}
                    />
                    <Typography variant='caption' color='textSecondary'>
                      Drag the marker to set the exact hospital location or use the search box above
                    </Typography>
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
