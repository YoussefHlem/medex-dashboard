import React from 'react'

import Grid from '@mui/material/Grid2'

import AccountDetails from '@views/doctor/settings/AccountDetails'

const Page = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AccountDetails />
      </Grid>
    </Grid>
  )
}

export default Page
