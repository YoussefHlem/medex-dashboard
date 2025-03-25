import React from 'react'

import Grid from '@mui/material/Grid2'

import DoctorSlots from '@/modules/doctor/DoctorSlots/DoctorSlots'

const Page = () => {
  return (
    <Grid container>
      <Grid size={{ xs: 12 }}>
        <DoctorSlots />
      </Grid>
    </Grid>
  )
}

export default Page
