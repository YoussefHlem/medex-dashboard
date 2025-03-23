import React, { useEffect, useRef, useState } from 'react'

import { Box, Typography, InputAdornment } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'

interface HospitalGoogleMapProps {
  formik: any
}

const HospitalGoogleMap = ({ formik }: HospitalGoogleMapProps) => {
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<any>(null)

  // Load the Google Maps API script.
  const loadGoogleMapsScript = () => {
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
    loadGoogleMapsScript()
  }, [])

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      initializeMap()
    }
  }, [mapLoaded])

  // Initialize the map and marker.
  const initializeMap = () => {
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
    })

    const marker = new (window as any).google.maps.Marker({
      position: defaultLocation,
      map: map,
      draggable: true
    })

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

      if (!places.length) return
      const place = places[0]

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

  // Update marker position if formik lat/lng values change.
  useEffect(() => {
    if (mapLoaded && markerRef.current && formik.values.lat && formik.values.lng) {
      const newPosition = {
        lat: parseFloat(String(formik.values.lat)),
        lng: parseFloat(String(formik.values.lng))
      }

      markerRef.current.setPosition(newPosition)
    }
  }, [formik.values.lat, formik.values.lng, mapLoaded])

  return (
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
  )
}

export default HospitalGoogleMap
