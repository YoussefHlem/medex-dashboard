'use client'
import { useEffect, useState } from 'react'

import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'

import { toast } from 'react-toastify'

import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'
import { doctorsService } from '@/apis/services/doctors'
import { specialitiesService } from '@/apis/services/specialities'

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  speciality_id: Yup.number().required('Speciality is required'),
  bio: Yup.string().required('Bio is required').min(10, 'Bio must be at least 10 characters'),
  experience: Yup.number().required('Experience is required').min(1, 'Experience must be at least 1 year'),
  description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  consultation_fee: Yup.number()
    .required('Consultation fee is required')
    .min(1, 'Consultation fee must be a positive number'),
  status: Yup.number().required('Status is required'),
  cover: Yup.mixed()
    .required('Cover image is required')
    .test(
      'fileType',
      'Unsupported file format',
      value => !value || (value && ['image/jpeg', 'image/png', 'image/gif'].includes(value.type))
    )
})

const DoctorForm = ({ id }: { id?: number }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [specialities, setSpecialities] = useState([])

  useEffect(() => {
    if (id) {
      doctorsService
        .getDoctor(id)
        .then(item => {
          const doctor = item.data.doctor

          setPreviewUrl(doctor.cover)
          formik.setValues({
            name: doctor.name,
            speciality_id: doctor.speciality_id,
            bio: doctor.bio,
            experience: doctor.experience,
            description: doctor.description,
            consultation_fee: doctor.consultation_fee,
            status: doctor.status === 'Active' ? 1 : 0,
            cover: null
          })
        })
        .catch(err => {
          toast.error(`Failed to fetch Doctor: ${err.response.data.message}`)
        })
    }
  }, [id])

  useEffect(() => {
    specialitiesService.listSpecialities().then(res => {
      setSpecialities(res.data.specialities)
    })
  }, [])

  const formik = useFormik({
    initialValues: {
      name: '',
      speciality_id: '',
      bio: '',
      experience: '',
      description: '',
      consultation_fee: '',
      status: '',
      cover: null
    },
    validationSchema,
    onSubmit: async values => {
      const formData = new FormData()

      if (id) {
        formData.append('_method', 'patch')
      }

      Object.keys(values).forEach(key => {
        formData.append(key, values[key])
      })

      try {
        id ? await doctorsService.updateDoctor(id, formData) : await doctorsService.createDoctor(formData)

        toast.success(`Doctor ${id ? 'Updated' : 'Created'} successfully`)
      } catch (err) {
        toast.error(`Failed to ${id ? 'Update' : 'Create'} Doctor: ${err.response.data.message}`)
      }
    }
  })

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

  return (
    <Card>
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                select
                fullWidth
                name='speciality_id'
                label='Speciality'
                value={formik.values.speciality_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.speciality_id && Boolean(formik.errors.speciality_id)}
                helperText={formik.touched.speciality_id && formik.errors.speciality_id}
              >
                {specialities.map((speciality: any) => (
                  <MenuItem key={speciality.id} value={speciality.id}>
                    {speciality.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>{' '}
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                name='name'
                label='Name'
                placeholder='Your Name'
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                name='bio'
                label='Bio'
                placeholder='Short biography'
                value={formik.values.bio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bio && Boolean(formik.errors.bio)}
                helperText={formik.touched.bio && formik.errors.bio}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                name='experience'
                label='Experience (years)'
                placeholder='Years of experience'
                value={formik.values.experience}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.experience && Boolean(formik.errors.experience)}
                helperText={formik.touched.experience && formik.errors.experience}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                name='description'
                label='Description'
                placeholder='Detailed description'
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                name='consultation_fee'
                label='Consultation Fee'
                placeholder='e.g., 100.00'
                type='number'
                value={formik.values.consultation_fee}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.consultation_fee && Boolean(formik.errors.consultation_fee)}
                helperText={formik.touched.consultation_fee && formik.errors.consultation_fee}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                select
                fullWidth
                name='status'
                label='Status'
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
              >
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={0}>Inactive</MenuItem>
              </CustomTextField>
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

export default DoctorForm
