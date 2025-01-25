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
import DoctorForm from '@components/forms/DoctorForm'
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import CalendarWrapper from '@views/apps/calendar/CalendarWrapper'
import { agendaService } from '@/apis/services/agenda'
import { setEvents } from '@/redux-store/slices/calendar'

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
    })
  }, [id, dispatch])

  return (
    <TabContext value={value}>
      <TabList onChange={handleChange} aria-label='doctor details tabs'>
        <Tab value='1' label='Details' icon={<i className='tabler-file-description' />} />
        <Tab value='2' label='Agenda' icon={<i className='tabler-calendar' />} />
      </TabList>
      <TabPanel value='1'>
        <DoctorForm id={id} />
      </TabPanel>
      <TabPanel value='2'>
        <Card className='overflow-visible'>
          <AppFullCalendar className='app-calendar'>
            <CalendarWrapper doctorId={id} />
          </AppFullCalendar>
        </Card>
      </TabPanel>
    </TabContext>
  )
}

export default DoctorDetails
