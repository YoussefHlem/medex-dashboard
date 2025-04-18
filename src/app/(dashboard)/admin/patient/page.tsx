import Grid from '@mui/material/Grid2'

import PatientsTable from '@/modules/patient/PatientsTable'

export default function Page() {
  return (
    <>
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <PatientsTable />
        </Grid>
      </Grid>
    </>
  )
}
