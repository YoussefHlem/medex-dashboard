import * as Yup from 'yup'

export const doctorValidationSchema = Yup.object({
  name: Yup.array()
    .of(
      Yup.object({
        langId: Yup.string().required('Language ID is required'),
        value: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters')
      })
    )
    .required('Name is required'),
  speciality_id: Yup.number().required('Speciality is required'),
  bio: Yup.string().required('Bio is required').min(10, 'Bio must be at least 10 characters'),
  experience: Yup.number().required('Experience is required').min(1, 'Experience must be at least 1 year'),
  description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  email: Yup.string().required('Email is required').email('Please enter a valid email'),
  consultation_fee: Yup.number().required('Consultation fee is required').min(1, 'Consultation fee must be a positive number'),
  status: Yup.number().required('Status is required'),
  cover: Yup.mixed()
    .test('fileOrString', 'Cover image is required', function (value) {
      return value instanceof File || (typeof value === 'string' && value.length > 0)
    })
    .test('fileSize', 'File is too large', (value) => {
      if (value instanceof File) {
        return value.size <= 5000000
      }


return true
    })
    .test('fileType', 'Unsupported file format', (value) => {
      if (value instanceof File) {
        return ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)
      }


return true
    }),
  rating: Yup.number().required('Rating is required').min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5')
})

export const initialDoctorFormValues = {
  name: [
    { langId: 'en', value: '' },
    { langId: 'ar', value: '' }
  ],
  speciality_id: '',
  bio: '',
  experience: '',
  description: '',
  email: '',
  consultation_fee: '',
  status: '',
  cover: null,
  rating: ''
}
