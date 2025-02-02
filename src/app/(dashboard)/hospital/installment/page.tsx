import Grid from '@mui/material/Grid2'

import InstallmentsTable from '@components/tables/InstallmentsTable'

export default function Page() {
  return (
    <Grid container>
      <Grid size={{ xs: 12 }}>
        <InstallmentsTable />
      </Grid>
    </Grid>
  )
}
