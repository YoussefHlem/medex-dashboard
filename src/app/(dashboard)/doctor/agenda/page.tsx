import React from 'react'

import Card from '@mui/material/Card'

import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import CalendarWrapper from '@views/apps/calendar/CalendarWrapper'

const Page = () => {
  const id = 1

  return (
    <Card className='overflow-visible'>
      <AppFullCalendar className='app-calendar'>
        <CalendarWrapper doctorId={id} />
      </AppFullCalendar>
    </Card>
  )
}

export default Page
