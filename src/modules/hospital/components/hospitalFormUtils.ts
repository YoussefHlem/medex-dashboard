import { toast } from 'react-toastify'

import { hospitalsService } from '@/apis/services/hospitals'
import type { HospitalFormValues } from '@/modules/hospital/entities/hospitalEntities'

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'Arabic' }
]

export const initialHospitalFormValues: HospitalFormValues = {
  name: LANGUAGES.map(lang => ({ langId: lang.id, value: '' })),
  address: '',
  phone: '',
  email: '',
  type: null,
  lat: '',
  lng: '',
  cover: null
}

export const createNewHospital = async (formData: FormData): Promise<void> => {
  await hospitalsService.createHospital(formData)
  toast.success('Hospital Created successfully')
}

export const updateExistingHospital = async (hospitalId: number, formData: FormData): Promise<void> => {
  await hospitalsService.updateHospital(hospitalId, formData)
  toast.success('Hospital Updated successfully')
}

export const handleHospitalApiError = (error: any, action: string): void => {
  toast.error(`Failed to ${action} Hospital ${error.response?.data?.message || error.message}`)
}

export const fetchHospitalData = async (hospitalId: number) => {
  try {
    const response = await hospitalsService.getHospital(hospitalId)

    return response.data.hospital
  } catch (error: any) {
    toast.error(`Failed to fetch Hospital ${error.response?.data?.message || error.message}`)

    return null
  }
}
