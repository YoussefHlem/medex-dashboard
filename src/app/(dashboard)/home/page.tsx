'use client'
import React, { useEffect } from 'react'

import { Container, Typography } from '@mui/material'

import { getProfile } from '@/apis/services/profile'

export default function WelcomeScreen() {
  useEffect(() => {
    getProfile().then(res => {
      localStorage.setItem('profile', JSON.stringify(res.data.user))
    })
  }, [])

  return (
    <Container maxWidth='sm' style={{ textAlign: 'center', marginTop: '50px' }}>
      <Typography variant='h2' component='h1' gutterBottom>
        Welcome to Medex Panel!
      </Typography>
    </Container>
  )
}
