'use client'

// React Imports
import type { SyntheticEvent } from 'react'
import { useEffect, useState } from 'react'

import { useDispatch } from 'react-redux'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Card from '@mui/material/Card'

// Custom Imports
import Grid from '@mui/material/Grid2'

import DoctorForm from '@/modules/doctor/DoctorForm'
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import CalendarWrapper from '@views/apps/calendar/CalendarWrapper'
import { agendaService } from '@/apis/services/agenda'
import { setEvents } from '@/redux-store/slices/calendar'
import BookingsTable from '@/modules/doctor/BookingsTables'
import DoctorSlots from '@components/DoctorSlots/DoctorSlots'

const DoctorDetails = ({ params }: { params: { id: number } }) => {
  const id = params.id
  const [value, setValue] = useState<string>('1')
  const dispatch = useDispatch()

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  useEffect(() => {
    agendaService.listAgendas(id).then(res => {
      console.log(res.data.agendas)
      dispatch(setEvents(res.data.agendas))
      const date = new Date()

      console.log(new Date(date.getFullYear(), date.getMonth() + 1, -11))
    })
  }, [id, dispatch])

  return (
    <TabContext value={value}>
      <TabList onChange={handleChange} aria-label='doctor details tabs'>
        <Tab value='1' label='Details' icon={<i className='tabler-file-description' />} />
        <Tab value='2' label='Agenda' icon={<i className='tabler-calendar' />} />
        <Tab value='3' label='Bookings' icon={<i className='tabler-book' />} />
        <Tab value='4' label='Slots' icon={<i className='tabler-calendar' />} />
      </TabList>
      <TabPanel value='1'>
        <DoctorForm id={id} />
      </TabPanel>
      <TabPanel value='2'>
        <Card className='overflow-visible'>
          <AppFullCalendar className='app-calendar'>
            <CalendarWrapper />
          </AppFullCalendar>
        </Card>
      </TabPanel>
      <TabPanel value='3'>
        <Grid container>
          <Grid size={{ xs: 12 }}>
            <BookingsTable id={id} />
          </Grid>
        </Grid>
      </TabPanel>
      <TabPanel value='4'>
        <Grid container>
          <Grid size={{ xs: 12 }}>
            <DoctorSlots id={id} />
          </Grid>
        </Grid>
      </TabPanel>
    </TabContext>
  )
}

export default DoctorDetails
