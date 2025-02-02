import React from 'react'

import Grid from '@mui/material/Grid2'

import DoctorSlots from '@components/DoctorSlots/DoctorSlots'

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
