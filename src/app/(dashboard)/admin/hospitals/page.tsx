import Grid from '@mui/material/Grid2'

import HospitalsTable from '@components/tables/HospitalsTable'

export default function Page() {
  return (
    <>
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <HospitalsTable />
        </Grid>
      </Grid>
    </>
  )
}
