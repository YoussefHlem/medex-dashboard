'use client'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

import type { FormikHelpers } from 'formik'
import { useFormik } from 'formik'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'
import { specialitiesService } from '@/apis/services/specialities'
import { specialtyValidationSchema } from '@/modules/speciality/utils/specialtyValidationSchema'

// Types
interface LanguageValue {
  langId: string
  value: string
}

interface SpecialtyFormValues {
  name: LanguageValue[]
  description: LanguageValue[]
  cover: File | string | null
}

interface SpecialtyFormProps {
  id?: number
}

interface SpecialtyData {
  name: LanguageValue[] | string
  description: LanguageValue[] | string
  cover: string
}

// Initial form values
const initialSpecialtyValues: SpecialtyFormValues = {
  name: [
    { langId: 'en', value: '' },
    { langId: 'ar', value: '' }
  ],
  description: [
    { langId: 'en', value: '' },
    { langId: 'ar', value: '' }
  ],
  cover: null
}

const SpecialtyForm = ({ id }: SpecialtyFormProps) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  // Prepare form data for submission
  const prepareFormData = (values: SpecialtyFormValues, editMode: boolean): FormData => {
    const formData = new FormData()

    if (editMode) {
      formData.append('_method', 'patch')
    }

    // Handle name array
    values.name.forEach((nameObj, index) => {
      Object.keys(nameObj).forEach(key => {
        formData.append(`name[${index}][${key}]`, nameObj[key as keyof LanguageValue])
      })
    })

    // Handle description array
    values.description.forEach((descObj, index) => {
      Object.keys(descObj).forEach(key => {
        formData.append(`description[${index}][${key}]`, descObj[key as keyof LanguageValue])
      })
    })

    // Handle other fields except name and description
    Object.keys(values).forEach(key => {
      if (key !== 'name' && key !== 'description' && values[key as keyof SpecialtyFormValues] !== null) {
        formData.append(key, values[key as keyof SpecialtyFormValues] as string | Blob)
      }
    })

    return formData
  }

  // Submit handler
  const handleSpecialtySubmit = async (
    values: SpecialtyFormValues,
    formikHelpers: FormikHelpers<SpecialtyFormValues>
  ): Promise<void> => {
    const formData = prepareFormData(values, Boolean(id))
    const isEditMode = Boolean(id)

    try {
      if (isEditMode && id) {
        await specialitiesService.updateSpeciality(id, formData)
      } else {
        await specialitiesService.createSpeciality(formData)
      }

      toast.success(`Specialty ${isEditMode ? 'Updated' : 'Created'} successfully`)
    } catch (err: any) {
      toast.error(
        `Failed to ${isEditMode ? 'Update' : 'Create'} Specialty: ${err.response?.data?.message || 'Unknown error'}`
      )
    } finally {
      formikHelpers.setSubmitting(false)
    }
  }

  // Process specialty data from API response
  const processSpecialtyData = (specialtyData: SpecialtyData): SpecialtyFormValues => {
    const nameValue = specialtyData.name
    const descriptionValue = specialtyData.description

    const nameArray = Array.isArray(nameValue)
      ? nameValue
      : [
          { langId: 'en', value: nameValue as string },
          { langId: 'ar', value: '' }
        ]

    const descriptionArray = Array.isArray(descriptionValue)
      ? descriptionValue
      : [
          { langId: 'en', value: descriptionValue as string },
          { langId: 'ar', value: '' }
        ]

    return {
      name: nameArray,
      description: descriptionArray,
      cover: specialtyData.cover
    }
  }

  // Fetch specialty data if in edit mode
  const fetchSpecialtyData = async (specialtyId: number): Promise<void> => {
    try {
      const response = await specialitiesService.getSpeciality(specialtyId)
      const specialtyData = response.data.speciality

      setImagePreviewUrl(specialtyData.cover)
      const processedData = processSpecialtyData(specialtyData)

      formik.setValues(processedData, true)
    } catch (err: any) {
      toast.error(`Failed to fetch Specialty: ${err.response?.data?.message || 'Unknown error'}`)
    }
  }

  useEffect(() => {
    if (id) {
      fetchSpecialtyData(id)
    }
  }, [id])

  // Handle image file selection
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

  // Handle name field changes for specific language
  const handleLanguageNameChange = (languageId: string, value: string): void => {
    const updatedNameArray = [...formik.values.name]
    const languageIndex = updatedNameArray.findIndex(item => item.langId === languageId)

    if (languageIndex !== -1) {
      updatedNameArray[languageIndex].value = value
      formik.setFieldValue('name', updatedNameArray)
    }
  }

  // Handle description field changes for specific language
  const handleLanguageDescriptionChange = (languageId: string, value: string): void => {
    const updatedDescriptionArray = [...formik.values.description]
    const languageIndex = updatedDescriptionArray.findIndex(item => item.langId === languageId)

    if (languageIndex !== -1) {
      updatedDescriptionArray[languageIndex].value = value
      formik.setFieldValue('description', updatedDescriptionArray)
    }
  }

  // Initialize formik
  const formik = useFormik<SpecialtyFormValues>({
    initialValues: initialSpecialtyValues,
    validationSchema: specialtyValidationSchema,
    onSubmit: handleSpecialtySubmit
  })

  // Render image upload section
  const renderImageUploadSection = (): JSX.Element => {
    return (
      <Grid>
        <input
          type='file'
          accept='image/*'
          id='cover-upload'
          name='cover'
          onChange={handleImageFileChange}
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
            {imagePreviewUrl ? (
              <Box
                component='img'
                src={imagePreviewUrl}
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
            {formik.errors.cover as string}
          </Typography>
        )}
      </Grid>
    )
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
                onChange={e => handleLanguageNameChange('en', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.name?.[0]?.value && Boolean(formik.errors.name?.[0]?.value)}
                helperText={formik.touched.name?.[0]?.value && formik.errors.name?.[0]?.value}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                name='name.1.value'
                label='Name (Arabic)'
                placeholder='Specialty Name in Arabic'
                value={formik.values.name[1].value}
                onChange={e => handleLanguageNameChange('ar', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.name?.[1]?.value && Boolean(formik.errors.name?.[1]?.value)}
                helperText={formik.touched.name?.[1]?.value && formik.errors.name?.[1]?.value}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                name='description.0.value'
                label='Description (English)'
                placeholder='Specialty Description in English'
                value={formik.values.description[0].value}
                onChange={e => handleLanguageDescriptionChange('en', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.description?.[0]?.value && Boolean(formik.errors.description?.[0]?.value)}
                helperText={formik.touched.description?.[0]?.value && formik.errors.description?.[0]?.value}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                name='description.1.value'
                label='Description (Arabic)'
                placeholder='Specialty Description in Arabic'
                value={formik.values.description[1].value}
                onChange={e => handleLanguageDescriptionChange('ar', e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.description?.[1]?.value && Boolean(formik.errors.description?.[1]?.value)}
                helperText={formik.touched.description?.[1]?.value && formik.errors.description?.[1]?.value}
              />
            </Grid>
            {renderImageUploadSection()}
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Button fullWidth type='submit' variant='contained' color='primary' disabled={formik.isSubmitting}>
              {id ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SpecialtyForm
