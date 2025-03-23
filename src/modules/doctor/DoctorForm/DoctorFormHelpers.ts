import { toast } from 'react-toastify'

import { doctorsService } from '@/apis/services/doctors'

// Convert API doctor data into the format used by the form.
export const formatDoctorDataForForm = (doctorData: any) => {
  const nameField = Array.isArray(doctorData.name)
    ? doctorData.name
    : [
      { langId: 'en', value: doctorData.name as string },
      { langId: 'ar', value: '' }
    ]

  return {
    name: nameField,
    speciality_id: doctorData.speciality_id,
    bio: doctorData.bio,
    experience: doctorData.experience,
    description: doctorData.description,
    email: doctorData.email,
    consultation_fee: doctorData.consultation_fee,
    status: doctorData.status === 'Active' ? 1 : 0,
    cover: doctorData.cover,
    rating: doctorData.rating
  }
}

// Submit doctor data (create or update) via the API.
export const submitDoctorDataRequest = async (formData: FormData, doctorId?: number): Promise<void> => {
  try {
    if (doctorId) {
      await doctorsService.updateDoctor(doctorId, formData)
      toast.success('Doctor updated successfully')
    } else {
      await doctorsService.createDoctor(formData)
      toast.success('Doctor created successfully')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'An unknown error occurred'

    toast.error(`Failed to ${doctorId ? 'update' : 'create'} doctor: ${errorMsg}`)
  }
}
