'use client'
import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useSelector } from 'react-redux'

import { Container, Typography, Grid, Card, CardContent, CardActionArea, Box, Paper, Avatar } from '@mui/material'

import { getProfile } from '@/apis/services/profile'
import type { RootState } from '@/redux-store'

// Define route cards based on user type
const adminRoutes = [
  {
    label: 'Hospital/Clinic',
    href: '/admin/hospitals',
    icon: 'tabler-building-hospital',
    description: 'Manage hospitals and clinics'
  },
  {
    label: 'Doctors',
    href: '/admin/doctors',
    icon: 'tabler-stethoscope',
    description: 'Manage doctor profiles and accounts'
  },
  {
    label: 'Speciality',
    href: '/admin/speciality',
    icon: 'tabler-medical-cross',
    description: 'Manage medical specialities'
  },
  { label: 'Patient', href: '/admin/patient', icon: 'tabler-user', description: 'View and manage patient information' },
  { label: 'Installment', href: '/admin/installment', icon: 'tabler-cash', description: 'Manage payment installments' },
  { label: 'Cards', href: '/admin/medex-cards', icon: 'tabler-credit-card-pay', description: 'Manage Medex cards' }
]

const doctorRoutes = [
  { label: 'Profile', href: '/doctor/profile', icon: 'tabler-user', description: 'View and update your profile' },
  { label: 'Agenda', href: '/doctor/agenda', icon: 'tabler-calendar', description: 'Manage your daily agenda' },
  { label: 'Schedule', href: '/doctor/schedule', icon: 'tabler-box', description: 'Set your availability schedule' },
  { label: 'Booking', href: '/doctor/booking', icon: 'tabler-book', description: 'View and manage patient bookings' }
]

const hospitalRoutes = [
  { label: 'Profile', href: '/hospital/profile', icon: 'tabler-user', description: 'View and update hospital profile' },
  {
    label: 'Installment',
    href: '/hospital/installment',
    icon: 'tabler-cash',
    description: 'Manage payment installments'
  }
]

export default function WelcomeScreen() {
  const router = useRouter()
  const [greeting, setGreeting] = useState('Good day')
  const userType = useSelector((state: RootState) => state.authReducer.userType)

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()

    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    // Fetch profile data
    getProfile().then(res => {
      localStorage.setItem('profile', JSON.stringify(res.data.user))
    })
  }, [])

  // Determine which routes to show based on user type
  const getRoutes = () => {
    switch (userType) {
      case 'Admin':
        return adminRoutes
      case 'Doctor':
        return doctorRoutes
      case 'Hospital':
        return hospitalRoutes
      default:
        return [] // No routes if user type is unknown
    }
  }

  const routes = getRoutes()

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          background:
            'linear-gradient(135deg, var(--mui-palette-primary-light) 0%, var(--mui-palette-primary-main) 100%)',
          color: 'white'
        }}
      >
        <Typography variant='h4' component='h1' gutterBottom>
          {greeting}!
        </Typography>
        <Typography variant='h6'>Welcome to your Medex Dashboard</Typography>
      </Paper>

      {routes.length > 0 ? (
        <Grid container spacing={3}>
          {routes.map((route, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardActionArea
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  onClick={() => router.push(route.href)}
                >
                  <CardContent sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          mr: 2
                        }}
                      >
                        <i className={route.icon} style={{ fontSize: '1.25rem' }} />
                      </Avatar>
                      <Typography variant='h6' component='div'>
                        {route.label}
                      </Typography>
                    </Box>
                    <Typography variant='body2' color='text.secondary'>
                      {route.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6' color='text.secondary'>
            Please log in to view your dashboard
          </Typography>
        </Paper>
      )}
    </Container>
  )
}
