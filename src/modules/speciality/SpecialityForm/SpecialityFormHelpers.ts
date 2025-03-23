import { toast } from 'react-toastify'

import { specialitiesService } from '@/apis/services/specialities'

export interface SpecialtyFormValues {
  name: { langId: string; value: string }[]
  description: string
  cover: File | string | null
}

// Fetch specialty data from the API and format it for the form.
export const fetchSpecialityData = async (specialtyId: number): Promise<SpecialtyFormValues | null> => {
  try {
    const response = await specialitiesService.getSpeciality(specialtyId)
    const specialtyData = response.data.speciality

    const nameField = Array.isArray(specialtyData.name)
      ? specialtyData.name
      : [
          { langId: 'en', value: specialtyData.name as string },
          { langId: 'ar', value: '' }
        ]

    return {
      name: nameField,
      description: specialtyData.description,
      cover: specialtyData.cover
    }
  } catch (error: any) {
    toast.error(`Failed to fetch Specialty: ${error.response?.data?.message || 'Unknown error'}`)

    return null
  }
}

// Submit the specialty data for create or update.
export const submitSpecialityData = async (formData: FormData, specialtyId?: number): Promise<void> => {
  try {
    if (specialtyId) {
      await specialitiesService.updateSpeciality(specialtyId, formData)
      toast.success('Specialty updated successfully')
    } else {
      await specialitiesService.createSpeciality(formData)
      toast.success('Specialty created successfully')
    }
  } catch (error: any) {
    toast.error(
      `Failed to ${specialtyId ? 'update' : 'create'} Specialty: ${error.response?.data?.message || 'Unknown error'}`
    )
  }
}
