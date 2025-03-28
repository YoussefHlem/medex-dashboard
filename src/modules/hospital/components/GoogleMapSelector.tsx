'use client'
import React, { useEffect, useRef, useState } from 'react'

import { Box, InputAdornment, TextField, Typography } from '@mui/material'

interface GoogleMapSelectorProps {
  initialLat: number
  initialLng: number
  onLocationChange: (lat: number, lng: number, address?: string) => void
}

const GoogleMapSelector: React.FC<GoogleMapSelectorProps> = ({ initialLat, initialLng, onLocationChange }) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const markerRef = useRef<google.maps.Marker | null>(null)

  // Load Google Maps API script
  const loadGoogleMapsScript = (): void => {
    if (!window.google) {
      const script = document.createElement('script')

      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    } else {
      setMapLoaded(true)
    }
  }

  useEffect(() => {
    loadGoogleMapsScript()
  }, [])

  // Initialize map once the script is loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      initializeGoogleMap()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded])

  const initializeGoogleMap = (): void => {
    const defaultLocation = { lat: initialLat, lng: initialLng }

    const map = new window.google.maps.Map(mapRef.current as HTMLElement, {
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

    // Update location when the marker is dragged
    marker.addListener('dragend', () => {
      const position = marker.getPosition()
      const lat = position.lat()
      const lng = position.lng()

      onLocationChange(lat, lng)
    })

    // Setup location search box
    setupLocationSearch(map, marker)
  }

  const setupLocationSearch = (map: google.maps.Map, marker: google.maps.Marker): void => {
    const input = document.getElementById('map-search-input') as HTMLInputElement
    const searchBox = new window.google.maps.places.SearchBox(input)

    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds)
    })

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces()

      if (!places || places.length === 0) return

      const place = places[0]

      if (!place.geometry || !place.geometry.location) return

      const location = place.geometry.location

      marker.setPosition(location)
      map.setCenter(location)

      const lat = location.lat()
      const lng = location.lng()

      onLocationChange(lat, lng, place.formatted_address)
    })
  }

  return (
    <>
      <TextField
        fullWidth
        id="map-search-input"
        placeholder="Search for a location..."
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <i className="tabler-search" />
            </InputAdornment>
          )
        }}
      />
      <Box ref={mapRef} sx={{ height: 400, borderRadius: 1, boxShadow: 3, mb: 2 }} />
      <Typography variant="caption" color="textSecondary">
        Drag the marker to set the exact hospital location or use the search box above
      </Typography>
    </>
  )
}

export default GoogleMapSelector
