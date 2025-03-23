'use client'
import type { ChangeEvent } from 'react'
import { useEffect, useState, useRef } from 'react'

import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, Button, Card, CardContent, InputAdornment, Typography, Grid } from '@mui/material'
import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'
import { hospitalsService } from '@/apis/services/hospitals'
import ImageUpload from '@/components/ImageUpload'
import MultiLangTextFields from '@/components/MultiLangTextFields'
import { appendMultilingualFields, appendOtherFields } from '@/utils/formHelpers'

interface NameTranslation {
  langId: string
  value: string
}

export interface HospitalFormValues {
  name: NameTranslation[]
  address: string
  phone: string
  email: string
  type: number | null
  lat: string | number
  lng: string | number
  cover: File | string | null
}

interface HospitalFormProps {
  id?: number
}

interface GoogleMapMarker {
  setPosition: (position: { lat: number; lng: number }) => void
  getPosition: () => { lat: () => number; lng: () => number }
  addListener: (event: string, callback: () => void) => void
}

interface GoogleMapInstance {
  setCenter: (position: { lat: number; lng: number }) => void
  getBounds: () => any
  addListener: (event: string, callback: () => void) => void
}

interface Place {
  geometry?: {
    location?: {
      lat: () => number
      lng: () => number
    }
  }
  formatted_address?: string
}

const hospitalValidationSchema = Yup.object({
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
    })
})

const initialHospitalFormValues: HospitalFormValues = {
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
}

const HospitalForm = ({ id }: HospitalFormProps) => {
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const [showMap, setShowMap] = useState<boolean>(false)
  const mapRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<GoogleMapMarker | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)

  const formik = useFormik<HospitalFormValues>({
    initialValues: initialHospitalFormValues,
    validationSchema: hospitalValidationSchema,
    onSubmit: async values => {
      const formData = new FormData()

      if (id) {
        formData.append('_method', 'patch')
      }

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

  const handleCoverImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]

    if (file) {
      formik.setFieldValue('cover', file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setCoverPreviewUrl(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleNameTranslationChange = (langId: string, value: string): void => {
    const nameArray = [...formik.values.name]
    const langIndex = nameArray.findIndex(item => item.langId === langId)

    if (langIndex !== -1) {
      nameArray[langIndex].value = value
      formik.setFieldValue('name', nameArray)
    }
  }

  const toggleMapVisibility = (): void => {
    setShowMap(!showMap)
  }

  // Load Google Maps API script
  useEffect(() => {
    loadGoogleMapsScript()
  }, [])

  const loadGoogleMapsScript = (): void => {
    if (!(window as any).google) {
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
  }

  useEffect(() => {
    if (mapLoaded && showMap && mapRef.current) {
      initializeGoogleMap()
    }
  }, [mapLoaded, showMap])

  const initializeGoogleMap = (): void => {
    const defaultLocation = {
      lat: formik.values.lat ? parseFloat(String(formik.values.lat)) : 30.0444,
      lng: formik.values.lng ? parseFloat(String(formik.values.lng)) : 31.2357
    }

    const map = new (window as any).google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 12,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: false
    }) as GoogleMapInstance

    const marker = new (window as any).google.maps.Marker({
      position: defaultLocation,
      map: map,
      draggable: true
    }) as GoogleMapMarker

    markerRef.current = marker
    marker.addListener('dragend', () => {
      const position = marker.getPosition()

      formik.setFieldValue('lat', position.lat())
      formik.setFieldValue('lng', position.lng())
    })
    const input = document.getElementById('map-search-input') as HTMLInputElement
    const searchBox = new (window as any).google.maps.places.SearchBox(input)

    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds())
    })
    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces()

      if (places.length === 0) return
      const place: Place = places[0]

      if (!place.geometry || !place.geometry.location) return
      const location = place.geometry.location

      marker.setPosition(location)
      map.setCenter(location)
      formik.setFieldValue('lat', location.lat())
      formik.setFieldValue('lng', location.lng())

      if (place.formatted_address) {
        formik.setFieldValue('address', place.formatted_address)
      }
    })
  }

  useEffect(() => {
    if (mapLoaded && markerRef.current && formik.values.lat && formik.values.lng) {
      const position = {
        lat: parseFloat(String(formik.values.lat)),
        lng: parseFloat(String(formik.values.lng))
      }

      markerRef.current.setPosition(position)
    }
  }, [formik.values.lat, formik.values.lng, mapLoaded])

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
      placeholder: 'المستشفى 1',
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
              onChange={handleNameTranslationChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && (typeof formik.errors.name === 'string' ? formik.errors.name : '')}
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
                <Typography variant='subtitle1' fontWeight='medium' sx={{ mb: 1 }}>
                  Hospital Location
                </Typography>
                <Button
                  variant='outlined'
                  color='primary'
                  startIcon={<i className='tabler-map' />}
                  onClick={toggleMapVisibility}
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
                    <Box ref={mapRef} sx={{ height: 400, borderRadius: 1, boxShadow: 3, mb: 2 }} />
                    <Typography variant='caption' color='textSecondary'>
                      Drag the marker to set the exact hospital location or use the search box above
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <ImageUpload
                id='cover-upload'
                name='cover'
                onChange={handleCoverImageChange}
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
