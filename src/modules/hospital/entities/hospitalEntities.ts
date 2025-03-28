// types.ts
export interface NameTranslation {
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

export interface HospitalFormProps {
  id?: number
}

export interface HospitalType {
  id: string
  name: string
  type: string
  cover: string
  lat: number
  lng: number
  status: string
}

export interface GoogleMapMarker {
  setPosition: (position: { lat: number; lng: number }) => void
  getPosition: () => { lat: () => number; lng: () => number }
  addListener: (event: string, callback: () => void) => void
}

export interface GoogleMapInstance {
  setCenter: (position: { lat: number; lng: number }) => void
  getBounds: () => any
  addListener: (event: string, callback: () => void) => void
}

export interface Place {
  geometry?: {
    location?: {
      lat: () => number
      lng: () => number
    }
  }
  formatted_address?: string
}
