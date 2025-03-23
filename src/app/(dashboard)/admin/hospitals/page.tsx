import Grid from '@mui/material/Grid2'

import HospitalsTable from '@/modules/hospital/HospitalsTable'

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
