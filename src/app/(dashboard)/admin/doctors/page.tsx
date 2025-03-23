import Grid from '@mui/material/Grid2'

import DoctorsTable from '@/modules/doctor/DoctorsTable'

export default function Page() {
  return (
    <>
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <DoctorsTable />
        </Grid>
      </Grid>
    </>
  )
}
