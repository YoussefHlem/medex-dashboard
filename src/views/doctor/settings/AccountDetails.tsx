// @ts-nocheck
'use client'

import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'

import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import { getProfile, updateProfile } from '@/apis/services/profile'

type Data = {
  name: string
  email: string
  phone_number: string | null
  gender: string | null
  date_of_birth: string | null
  avatar: string
  address: string | null
}

const initialData: Data = {
  name: '',
  email: '',
  phone_number: null,
  gender: null,
  date_of_birth: null,
  avatar: '',
  address: null
}

const AccountDetails = () => {
  const [formData, setFormData] = useState<Data>(initialData)
  const [fileInput, setFileInput] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState<string>(formData.avatar)

  const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFileInputChange = (file: ChangeEvent) => {
    const { files } = file.target as HTMLInputElement

    if (files && files.length !== 0) {
      const selectedFile = files[0]

      setFileInput(selectedFile)

      const reader = new FileReader()

      reader.onload = () => {
        setImgSrc(reader.result as string)
      }

      reader.readAsDataURL(selectedFile)
    }
  }

  const handleFileInputReset = () => {
    setFileInput(null)
    setImgSrc(formData.avatar)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitFormData = new FormData()

    // Append all form fields
    if (fileInput) {
      submitFormData.append('avatar', fileInput)
    }

    submitFormData.append('name', formData.name)
    submitFormData.append('email', formData.email)
    submitFormData.append('phone_number', formData.phone_number)
    submitFormData.append('gender', formData.gender)
    submitFormData.append('date_of_birth', formData.date_of_birth)
    submitFormData.append('address', formData.address)
    submitFormData.append('_method', 'PUT')

    updateProfile(submitFormData)
      .then(() => {
        toast.success('Profile updated successfully')
      })
      .catch(() => {
        toast.error('Failed to update profile')
      })
  }

  useEffect(() => {
    getProfile().then(({ data }) => {
      setFormData({ ...data.user, gender: data.user.gender === 'male' ? 1 : 2 })
      setImgSrc(data.user.avatar)
    })
  }, [])

  return (
    <Card>
      <CardContent className='mbe-4'>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
          <div className='flex flex-grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button component='label' variant='contained' htmlFor='account-settings-upload-image'>
                Upload New Photo
                <input
                  hidden
                  type='file'
                  accept='image/png, image/jpeg'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
                />
              </Button>
              <Button variant='tonal' color='secondary' onClick={handleFileInputReset}>
                Reset
              </Button>
            </div>
            <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <form onSubmit={e => handleSubmit(e)}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Full Name'
                value={formData.name}
                placeholder='Veda Morgan'
                onChange={e => handleFormChange('name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Email'
                value={formData.email}
                placeholder='dywyxixi@mailinator.com'
                onChange={e => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Phone Number'
                value={formData.phone_number || ''}
                placeholder='+1 (234) 567-8901'
                onChange={e => handleFormChange('phone_number', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                label='Gender'
                value={formData.gender || ''}
                onChange={e => handleFormChange('gender', e.target.value)}
              >
                <MenuItem value='1'>Male</MenuItem>
                <MenuItem value='2'>Female</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                type='date'
                label='Date of Birth'
                value={formData.date_of_birth || ''}
                onChange={e => handleFormChange('date_of_birth', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Address'
                value={formData.address || ''}
                placeholder='Address'
                onChange={e => handleFormChange('address', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit'>
                Save Changes
              </Button>
              <Button variant='tonal' type='reset' color='secondary' onClick={() => setFormData(initialData)}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
