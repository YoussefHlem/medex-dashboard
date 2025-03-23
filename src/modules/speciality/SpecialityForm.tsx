'use client'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

import type { FormikHelpers } from 'formik'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, Button, Card, CardContent, Typography, Grid } from '@mui/material'
import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'
import { specialitiesService } from '@/apis/services/specialities'
import ImageUpload from '@/components/ImageUpload'
import MultiLangTextFields from '@/components/MultiLangTextFields'
import { appendMultilingualFields, appendOtherFields } from '@/utils/formHelpers'

interface LanguageValue {
  langId: string
  value: string
}

export interface SpecialtyFormValues {
  name: LanguageValue[]
  description: string
  cover: File | string | null
}

interface SpecialtyFormProps {
  id?: number
}

interface SpecialtyData {
  name: LanguageValue[] | string
  description: string
  cover: string
}

const specialtyValidationSchema = Yup.object({
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
      return value instanceof File || (typeof value === 'string' && value.length > 0)
    })
    .test('fileSize', 'File is too large', value => {
      if (value instanceof File) {
        return value.size <= 5000000
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

const initialSpecialtyValues: SpecialtyFormValues = {
  name: [
    { langId: 'en', value: '' },
    { langId: 'ar', value: '' }
  ],
  description: '',
  cover: null
}

const SpecialtyForm = ({ id }: SpecialtyFormProps) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  const formik = useFormik<SpecialtyFormValues>({
    initialValues: initialSpecialtyValues,
    validationSchema: specialtyValidationSchema,
    onSubmit: async (values, formikHelpers: FormikHelpers<SpecialtyFormValues>) => {
      const formData = new FormData()

      if (id) {
        formData.append('_method', 'patch')
      }

      appendMultilingualFields(formData, 'name', values.name)
      appendOtherFields(formData, values, ['name'])

      try {
        if (id) {
          await specialitiesService.updateSpeciality(id, formData)
          toast.success('Specialty Updated successfully')
        } else {
          await specialitiesService.createSpeciality(formData)
          toast.success('Specialty Created successfully')
        }
      } catch (err: any) {
        toast.error(
          `Failed to ${id ? 'Update' : 'Create'} Specialty: ${err.response?.data?.message || 'Unknown error'}`
        )
      } finally {
        formikHelpers.setSubmitting(false)
      }
    }
  })

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.currentTarget.files?.[0]

    if (!file) return
    formik.setFieldValue('cover', file)
    const reader = new FileReader()

    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  const handleLanguageNameChange = (languageId: string, value: string): void => {
    const updatedNameArray = [...formik.values.name]
    const languageIndex = updatedNameArray.findIndex(item => item.langId === languageId)

    if (languageIndex !== -1) {
      updatedNameArray[languageIndex].value = value
      formik.setFieldValue('name', updatedNameArray)
    }
  }

  const fetchSpecialtyData = async (specialtyId: number): Promise<void> => {
    try {
      const response = await specialitiesService.getSpeciality(specialtyId)
      const specialtyData: SpecialtyData = response.data.speciality

      setImagePreviewUrl(specialtyData.cover)

      const nameArray = Array.isArray(specialtyData.name)
        ? specialtyData.name
        : [
            { langId: 'en', value: specialtyData.name as string },
            { langId: 'ar', value: '' }
          ]

      formik.setValues(
        {
          name: nameArray,
          description: specialtyData.description,
          cover: specialtyData.cover
        },
        true
      )
    } catch (err: any) {
      toast.error(`Failed to fetch Specialty: ${err.response?.data?.message || 'Unknown error'}`)
    }
  }

  useEffect(() => {
    if (id) {
      fetchSpecialtyData(id)
    }
  }, [id])

  const languages = [
    { langId: 'en', label: 'Name (English)', placeholder: 'Specialty Name in English' },
    { langId: 'ar', label: 'Name (Arabic)', placeholder: 'Specialty Name in Arabic' }
  ]

  return (
    <Card>
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={6}>
            <MultiLangTextFields
              languages={languages}
              values={formik.values.name}
              onChange={handleLanguageNameChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && (formik.errors.name as string)}
            />
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <ImageUpload
                id='cover-upload'
                name='cover'
                onChange={handleImageFileChange}
                imagePreviewUrl={imagePreviewUrl}
                touched={formik.touched.cover}
                error={formik.errors.cover as string}
              />
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
