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

// Types
interface NameTranslation {
  langId: string
  value: string
}

interface HospitalFormValues {
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

// Validation schema
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

// Initial form values
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

  // Form management with Formik
  const hospitalFormik = useFormik<HospitalFormValues>({
    initialValues: initialHospitalFormValues,
    validationSchema: hospitalValidationSchema,
    onSubmit: async values => {
      await handleSubmitHospitalForm(values)
    }
  })

  // Handle form submission
  const handleSubmitHospitalForm = async (values: HospitalFormValues) => {
    const formData = createHospitalFormData(values, id)

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

  // Create FormData from form values
  const createHospitalFormData = (values: HospitalFormValues, hospitalId?: number): FormData => {
    const formData = new FormData()

    if (hospitalId) {
      formData.append('_method', 'patch')
    }

    // Append name translations
    values.name.forEach((nameObj, index) => {
      Object.keys(nameObj).forEach(key => {
        formData.append(`name[${index}][${key}]`, nameObj[key])
      })
    })

    // Append other form values
    Object.keys(values).forEach(key => {
      if (key !== 'name' && values[key] !== null) {
        formData.append(key, values[key as keyof HospitalFormValues] as string | Blob)
      }
    })

    return formData
  }

  // Create a new hospital
  const createNewHospital = async (formData: FormData): Promise<void> => {
    await hospitalsService.createHospital(formData)
    toast.success('Hospital Created successfully')
  }

  // Update an existing hospital
  const updateExistingHospital = async (hospitalId: number, formData: FormData): Promise<void> => {
    await hospitalsService.updateHospital(hospitalId, formData)
    toast.success('Hospital Updated successfully')
  }

  // Handle API errors
  const handleHospitalApiError = (error: any, action: string): void => {
    toast.error(`Failed to ${action} Hospital ${error.response?.data?.message || error.message}`)
  }

  // Load existing hospital data when editing
  useEffect(() => {
    if (id) {
      fetchHospitalData(id)
    }
  }, [id])

  // Fetch hospital data for editing
  const fetchHospitalData = async (hospitalId: number): Promise<void> => {
    try {
      const response = await hospitalsService.getHospital(hospitalId)
      const hospital = response.data.hospital

      populateFormWithHospitalData(hospital)
    } catch (error: any) {
      toast.error(`Failed to fetch Hospital ${error.response?.data?.message || error.message}`)
    }
  }

  // Populate form with hospital data
  const populateFormWithHospitalData = (hospital: any): void => {
    const nameValue = hospital.name || ''

    const nameArray = [
      { langId: 'en', value: nameValue },
      { langId: 'ar', value: '' }
    ]

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

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript()
  }, [])

  // Load Google Maps API script
  const loadGoogleMapsScript = (): void => {
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
  }

  // Initialize map when it should be displayed
  useEffect(() => {
    if (mapLoaded && showMap && mapRef.current) {
      initializeGoogleMap()
    }
  }, [mapLoaded, showMap, mapRef.current])

  // Initialize Google Map
  const initializeGoogleMap = (): void => {
    const defaultLocation = {
      lat: hospitalFormik.values.lat ? parseFloat(String(hospitalFormik.values.lat)) : 30.0444,
      lng: hospitalFormik.values.lng ? parseFloat(String(hospitalFormik.values.lng)) : 31.2357
    }

    // Create map instance
    const map = new window.google.maps.Map(mapRef.current as HTMLElement, {
      center: defaultLocation,
      zoom: 12,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: false
    }) as GoogleMapInstance

    // Create marker
    const marker = new window.google.maps.Marker({
      position: defaultLocation,
      map: map,
      draggable: true
    }) as GoogleMapMarker

    markerRef.current = marker

    // Set up marker drag event
    setupMarkerDragEvent(marker)

    // Set up location search
    setupLocationSearch(map, marker)
  }

  // Setup marker drag event
  const setupMarkerDragEvent = (marker: GoogleMapMarker): void => {
    marker.addListener('dragend', () => {
      const position = marker.getPosition()
      const lat = position.lat()
      const lng = position.lng()

      hospitalFormik.setFieldValue('lat', lat)
      hospitalFormik.setFieldValue('lng', lng)
    })
  }

  // Setup location search functionality
  const setupLocationSearch = (map: GoogleMapInstance, marker: GoogleMapMarker): void => {
    const input = document.getElementById('map-search-input') as HTMLInputElement
    const searchBox = new window.google.maps.places.SearchBox(input)

    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds())
    })

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces()

      if (places.length === 0) return

      const place = places[0] as Place

      if (!place.geometry || !place.geometry.location) return

      updateLocationFromPlace(place, map, marker)
    })
  }

  // Update location based on selected place
  const updateLocationFromPlace = (place: Place, map: GoogleMapInstance, marker: GoogleMapMarker): void => {
    if (!place.geometry?.location) return

    const location = place.geometry.location

    marker.setPosition(location)
    map.setCenter(location)

    const lat = location.lat()
    const lng = location.lng()

    hospitalFormik.setFieldValue('lat', lat)
    hospitalFormik.setFieldValue('lng', lng)

    // Update address field if available
    if (place.formatted_address) {
      hospitalFormik.setFieldValue('address', place.formatted_address)
    }
  }

  // Update marker position when lat/lng values change
  useEffect(() => {
    updateMarkerPosition()
  }, [hospitalFormik.values.lat, hospitalFormik.values.lng, mapLoaded])

  // Update marker position based on form values
  const updateMarkerPosition = (): void => {
    if (mapLoaded && markerRef.current && hospitalFormik.values.lat && hospitalFormik.values.lng) {
      const position = {
        lat: parseFloat(String(hospitalFormik.values.lat)),
        lng: parseFloat(String(hospitalFormik.values.lng))
      }

      markerRef.current.setPosition(position)
    }
  }

  // Handle cover image change
  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]

    if (file) {
      hospitalFormik.setFieldValue('cover', file)
      createFilePreview(file)
    }
  }

  // Create file preview URL
  const createFilePreview = (file: File): void => {
    const reader = new FileReader()

    reader.onloadend = () => {
      setCoverPreviewUrl(reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  // Handle name field change for specific language
  const handleNameTranslationChange = (langId: string, value: string): void => {
    const nameArray = [...hospitalFormik.values.name]
    const langIndex = nameArray.findIndex(item => item.langId === langId)

    if (langIndex !== -1) {
      nameArray[langIndex].value = value
      hospitalFormik.setFieldValue('name', nameArray)
    }
  }

  // Toggle map visibility
  const toggleMapVisibility = (): void => {
    setShowMap(!showMap)
  }

  return (
    <Card>
      <CardContent>
        <Form onSubmit={hospitalFormik.handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomTextField
                    fullWidth
                    name='name-en'
                    label='Name (English)'
                    placeholder='Hospital 1'
                    value={hospitalFormik.values.name.find(item => item.langId === 'en')?.value || ''}
                    onChange={e => handleNameTranslationChange('en', e.target.value)}
                    onBlur={hospitalFormik.handleBlur}
                    error={hospitalFormik.touched.name && Boolean(hospitalFormik.errors.name)}
                    helperText={
                      hospitalFormik.touched.name && typeof hospitalFormik.errors.name === 'string'
                        ? hospitalFormik.errors.name
                        : ''
                    }
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
                    value={hospitalFormik.values.name.find(item => item.langId === 'ar')?.value || ''}
                    onChange={e => handleNameTranslationChange('ar', e.target.value)}
                    onBlur={hospitalFormik.handleBlur}
                    error={hospitalFormik.touched.name && Boolean(hospitalFormik.errors.name)}
                    helperText={
                      hospitalFormik.touched.name && typeof hospitalFormik.errors.name === 'string'
                        ? hospitalFormik.errors.name
                        : ''
                    }
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
            <Grid>
              <input
                type='file'
                accept='image/*'
                id='cover-upload'
                name='cover'
                onChange={handleCoverImageChange}
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
                    borderColor:
                      hospitalFormik.touched.cover && hospitalFormik.errors.cover ? 'error.main' : 'primary.main',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor:
                        hospitalFormik.touched.cover && hospitalFormik.errors.cover ? 'error.dark' : 'primary.dark',
                      opacity: 0.8
                    }
                  }}
                >
                  {coverPreviewUrl ? (
                    <Box
                      component='img'
                      src={coverPreviewUrl}
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
              {hospitalFormik.touched.cover && hospitalFormik.errors.cover && (
                <Typography color='error' variant='caption' sx={{ mt: 1, display: 'block' }}>
                  {hospitalFormik.errors.cover as string}
                </Typography>
              )}
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
