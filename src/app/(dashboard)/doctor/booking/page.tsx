import React from 'react'

import Grid from '@mui/material/Grid2'

import BookingsTable from '@/modules/doctor/BookingsTables'

const Page = () => {
  const id = 1

  return (
    <Grid container>
      <Grid size={{ xs: 12 }}>
        <BookingsTable id={id} />
      </Grid>
    </Grid>
  )
}

export default Page
