import React from 'react'

import { Box, Card, Typography } from '@mui/material'

interface ImageUploadFieldProps {
  formik: any
  previewUrl: string | null
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  fieldName?: string
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  formik,
  previewUrl,
  onImageChange,
  fieldName = 'cover'
}) => {
  return (
    <>
      <input
        type='file'
        accept='image/*'
        id={`${fieldName}-upload`}
        name={fieldName}
        onChange={onImageChange}
        style={{ display: 'none' }}
      />
      <label htmlFor={`${fieldName}-upload`}>
        <Card
          sx={{
            width: 'fit-content',
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: formik.touched[fieldName] && formik.errors[fieldName] ? 'error.main' : 'primary.main',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: formik.touched[fieldName] && formik.errors[fieldName] ? 'error.dark' : 'primary.dark',
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
                objectFit: 'fit'
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
      {formik.touched[fieldName] && formik.errors[fieldName] && (
        <Typography color='error' variant='caption' sx={{ mt: 1, display: 'block' }}>
          {formik.errors[fieldName] as string}
        </Typography>
      )}
    </>
  )
}
