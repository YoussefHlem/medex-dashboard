'use client'
import React, { useEffect, useState } from 'react'

import type { FormikHelpers } from 'formik'
import { useFormik } from 'formik'
import { Box, Button, Card, CardContent, Grid } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import Form from '@components/Form'
import ImageUpload from '@/components/ImageUpload'
import { specialtyValidationSchema, initialSpecialtyValues } from './SpecialityFormValidation'
import { fetchSpecialityData, submitSpecialityData } from './SpecialityFormHelpers'
import MultiLangTextFields from '@components/MultiLangTextFields'

interface SpecialtyFormProps {
  id?: number
}

const SpecialityForm = ({ id }: SpecialtyFormProps) => {
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const formik = useFormik({
    initialValues: initialSpecialtyValues,
    validationSchema: specialtyValidationSchema,
    onSubmit: async (values, formikHelpers: FormikHelpers<any>) => {
      const formData = new FormData()

      if (id) formData.append('_method', 'patch')

      // Append multilingual fields and rest of the data.
      import('@/utils/formHelpers').then(({ appendMultilingualFields, appendOtherFields }) => {
        appendMultilingualFields(formData, 'name', values.name)
        appendOtherFields(formData, values, ['name'])
      })
      await submitSpecialityData(formData, id)
      formikHelpers.setSubmitting(false)
    }
  })

  // Update the multilingual name field.
  const updateLanguageName = (langId: string, text: string): void => {
    const updatedNames = formik.values.name.map(item => (item.langId === langId ? { ...item, value: text } : item))

    formik.setFieldValue('name', updatedNames)
  }

  // Handle image file selection and preview.
  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.currentTarget.files?.[0]

    if (!file) return

    formik.setFieldValue('cover', file)
    const reader = new FileReader()

    reader.onloadend = () => setCoverPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Load specialty data when editing.
  const loadSpecialtyData = async (specialtyId: number): Promise<void> => {
    const data = await fetchSpecialityData(specialtyId)

    if (data) {
      setCoverPreview(data.cover)
      formik.setValues(data, true)
    }
  }

  useEffect(() => {
    if (id) loadSpecialtyData(id)
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
              onChange={updateLanguageName}
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
                onChange={handleCoverChange}
                imagePreviewUrl={coverPreview}
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

export default SpecialityForm
