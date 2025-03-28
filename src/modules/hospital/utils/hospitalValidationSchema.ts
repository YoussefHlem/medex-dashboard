import * as Yup from 'yup'

export const hospitalValidationSchema = Yup.object({
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
