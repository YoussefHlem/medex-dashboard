import Grid from '@mui/material/Grid2'

import MedexCardsTable from '@/modules/medex-cards/views/MedexCardsTable'

export default function Page() {
  return (
    <>
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <MedexCardsTable />
        </Grid>
      </Grid>
    </>
  )
}
