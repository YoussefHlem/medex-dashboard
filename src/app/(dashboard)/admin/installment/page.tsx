import Grid from '@mui/material/Grid2'

import InstallmentsTable from '@/modules/installment/views/InstallmentsTable'

export default function Page() {
  return (
    <Grid container>
      <Grid size={{ xs: 12 }}>
        <InstallmentsTable />
      </Grid>
    </Grid>
  )
}
