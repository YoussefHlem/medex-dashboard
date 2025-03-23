import type { ChangeEvent } from 'react'

import { Box, Card, Typography } from '@mui/material'

interface ImageUploadProps {
  id: string
  name: string
  accept?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  imagePreviewUrl: string | null
  touched?: boolean
  error?: string
  uploadLabel?: string
}

const ImageUpload = ({
  id,
  name,
  accept = 'image/*',
  onChange,
  imagePreviewUrl,
  touched,
  error,
  uploadLabel = 'Upload Cover Image'
}: ImageUploadProps) => {
  return (
    <>
      <input type='file' accept={accept} id={id} name={name} onChange={onChange} style={{ display: 'none' }} />
      <label htmlFor={id}>
        <Card
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: touched && error ? 'error.main' : 'primary.main',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: touched && error ? 'error.dark' : 'primary.dark',
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
                {uploadLabel}
              </Typography>
              <Typography variant='caption' color='textSecondary'>
                Click to select an image (JPG, PNG, or GIF)
              </Typography>
            </Box>
          )}
        </Card>
      </label>
      {touched && error && (
        <Typography color='error' variant='caption' sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </>
  )
}

export default ImageUpload
