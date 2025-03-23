'use client'
import { useEffect, useState } from 'react'

import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'

import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'
import { specialitiesService } from '@/apis/services/specialities'

const validationSchema = Yup.object({
  name: Yup.array()
    .of(
      Yup.object({
        langId: Yup.string().required('Language ID is required'),
        value: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters')
      })
    )
    .required('Name is required'),
  description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  cover: Yup.mixed()
    .test('fileOrString', 'Cover image is required', function (value) {
      // Accept either a File object or a URL string
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

const SpecialtyForm = ({ id }: { id?: number }) => {
  const formik = useFormik({
    initialValues: {
      name: [
        { langId: 'en', value: '' },
        { langId: 'ar', value: '' }
      ],
      description: '',
      cover: null
    },
    validationSchema,
    onSubmit: async values => {
      const formData = new FormData()

      if (id) {
        formData.append('_method', 'patch')
      }

      // Don't stringify the name array, append each object as individual form fields
      values.name.forEach((nameObj, index) => {
        Object.keys(nameObj).forEach(key => {
          formData.append(`name[${index}][${key}]`, nameObj[key])
        })
      })

      // Handle other fields
      Object.keys(values).forEach(key => {
        if (key !== 'name') {
          formData.append(key, values[key])
        }
      })

      try {
        id
          ? await specialitiesService.updateSpeciality(id, formData)
          : await specialitiesService.createSpeciality(formData)

        toast.success(`Specialty ${id ? 'Updated' : 'Created'} successfully`)
      } catch (err) {
        toast.error(`Failed to ${id ? 'Update' : 'Create'} Specialty: ${err.response.data.message}`)
      }
    }
  })

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      specialitiesService
        .getSpeciality(id)
        .then(item => {
          const speciality = item.data.speciality

          setPreviewUrl(speciality.cover)

          // Handle name field conversion
          const nameValue = speciality.name

          const nameArray = Array.isArray(nameValue)
            ? nameValue
            : [
                { langId: 'en', value: nameValue },
                { langId: 'ar', value: '' }
              ]

          formik.setValues(
            {
              name: nameArray,
              description: speciality.description,
              cover: speciality.cover
            },
            true
          )
        })
        .catch(err => {
          toast.error(`Failed to fetch Specialty: ${err.response.data.message}`)
        })
    }
  }, [])

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      formik.setFieldValue('cover', file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleNameChange = (lang: string, value: string) => {
    const nameArray = [...formik.values.name]
    const index = nameArray.findIndex(item => item.langId === lang)

    if (index !== -1) {
      nameArray[index].value = value
    }

    formik.setFieldValue('name', nameArray)
  }

  return (
    <Card>
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                name='name.0.value'
                label='Name (English)'
                placeholder='Specialty Name in English'
                value={formik.values.name[0].value}
                onChange={e => handleNameChange('en', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                name='name.1.value'
                label='Name (Arabic)'
                placeholder='Specialty Name in Arabic'
                value={formik.values.name[1].value}
                onChange={e => handleNameChange('ar', e.target.value)}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                name='description'
                label='Description'
                placeholder='Specialty Description'
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            <Grid>
              <input
                type='file'
                accept='image/*'
                id='cover-upload'
                name='cover'
                onChange={handleImageChange}
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
                    borderColor: formik.touched.cover && formik.errors.cover ? 'error.main' : 'primary.main',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: formik.touched.cover && formik.errors.cover ? 'error.dark' : 'primary.dark',
                      opacity: 0.8
                    }
                  }}
                >
                  {previewUrl ? (
                    <Box
                      component='img'
                      src={previewUrl}
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
              {formik.touched.cover && formik.errors.cover && (
                <Typography color='error' variant='caption' sx={{ mt: 1, display: 'block' }}>
                  {formik.errors.cover}
                </Typography>
              )}
            </Grid>
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Button
              fullWidth
              type='submit'
              variant='contained'
              color='primary'
              disabled={!formik.isValid || formik.isSubmitting}
            >
              {id ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SpecialtyForm
