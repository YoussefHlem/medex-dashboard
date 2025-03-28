'use client'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

import type { FormikHelpers } from 'formik'
import { useFormik } from 'formik'
import { Box, Button, Card, CardContent } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { toast } from 'react-toastify'

import Form from '@components/form/Form'
import { specialitiesService } from '@/apis/services/specialities'
import { specialtyValidationSchema } from '@/modules/speciality/utils/specialtyValidationSchema'
import { createFilePreview, createMultiLanguageFormData } from '@components/form/formUtils'
import { MultiLanguageTextField } from '@components/form/MultiLanguageTextField'
import { ImageUploadField } from '@components/form/ImageUploadField'

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

// Language configurations
const languages = [
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'Arabic' }
]

// Initial form values
const initialSpecialtyValues: SpecialtyFormValues = {
  name: languages.map(lang => ({ langId: lang.id, value: '' })),
  description: languages.map(lang => ({ langId: lang.id, value: '' })),
  cover: null
}

const SpecialtyForm = ({ id }: SpecialtyFormProps) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  // Submit handler
  const handleSpecialtySubmit = async (
    values: SpecialtyFormValues,
    formikHelpers: FormikHelpers<SpecialtyFormValues>
  ): Promise<void> => {
    const formData = createMultiLanguageFormData(values, ['name', 'description'])

    const isEditMode = Boolean(id)

    try {
      if (isEditMode && id) {
        formData.append('_method', 'patch')
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
    const processMultiLanguageField = (value: LanguageValue[] | string, defaultLangId: string): LanguageValue[] => {
      return Array.isArray(value)
        ? value
        : languages.map(lang => ({
            langId: lang.id,
            value: lang.id === defaultLangId ? (value as string) : ''
          }))
    }

    return {
      name: processMultiLanguageField(specialtyData.name, 'en'),
      description: processMultiLanguageField(specialtyData.description, 'en'),
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
  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.currentTarget.files?.[0]

    if (!file) return

    formik.setFieldValue('cover', file)

    try {
      const previewUrl = await createFilePreview(file)

      setImagePreviewUrl(previewUrl)
    } catch (error) {
      toast.error('Failed to preview image')
    }
  }

  // Handle multilanguage field changes
  const createLanguageChangeHandler =
    (fieldName: keyof Pick<SpecialtyFormValues, 'name' | 'description'>) =>
    (languageId: string, value: string): void => {
      const currentValues = [...formik.values[fieldName]]
      const languageIndex = currentValues.findIndex(item => item.langId === languageId)

      if (languageIndex !== -1) {
        currentValues[languageIndex].value = value
        formik.setFieldValue(fieldName, currentValues)
      }
    }

  // Initialize formik
  const formik = useFormik<SpecialtyFormValues>({
    initialValues: initialSpecialtyValues,
    validationSchema: specialtyValidationSchema,
    onSubmit: handleSpecialtySubmit
  })

  return (
    <Card>
      <CardContent>
        <Form onSubmit={formik.handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <MultiLanguageTextField
                formik={formik}
                languages={languages}
                name='name'
                onLanguageChange={createLanguageChangeHandler('name')}
                placeholder='Specialty Name'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <MultiLanguageTextField
                formik={formik}
                languages={languages}
                name='description'
                onLanguageChange={createLanguageChangeHandler('description')}
                placeholder='Specialty Description'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ImageUploadField
                formik={formik}
                previewUrl={imagePreviewUrl}
                onImageChange={handleImageFileChange}
                fieldName='cover'
              />
            </Grid>
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
