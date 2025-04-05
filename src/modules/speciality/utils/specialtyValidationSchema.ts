import * as Yup from 'yup'

export const specialtyValidationSchema = Yup.object({
  name: Yup.array()
    .of(
      Yup.object({
        langId: Yup.string().required('Language ID is required'),
        value: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters')
      })
    )
    .required('Name is required'),
  description: Yup.array()
    .of(
      Yup.object({
        langId: Yup.string().required('Language ID is required'),
        value: Yup.string().required('Description is required').min(5, 'Description must be at least 5 characters')
      })
    )
    .required('Description is required'),
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
