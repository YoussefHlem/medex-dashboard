import Grid from '@mui/material/Grid2'

import SpecialitiesTable from '@/modules/speciality/views/SpecialitiesTable'

export default function Page() {
  return (
    <>
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <SpecialitiesTable />
        </Grid>
      </Grid>
    </>
  )
}
