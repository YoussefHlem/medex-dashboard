import React from 'react'

import { Box, Divider, List, ListItem, ListItemIcon, ListItemText, Switch, Typography } from '@mui/material'
import { Calendar, PenSquare, Timer, User } from 'lucide-react'

import type { Slot } from '@/modules/doctor/DoctorSlots/doctor-slots'

interface SlotListProps {
  slots: Slot[]
  onEdit: (index: number) => void
  onSwitchChange: (dayIndex: number, slotIndex: number) => void
}

const SlotList: React.FC<SlotListProps> = ({ slots, onEdit, onSwitchChange }) => {
  return (
    <>
      {slots.map((day, dayIndex) => (
        <Box key={dayIndex} className='mb-4'>
          <Box className='flex items-center justify-between mb-2'>
            <Box className='flex items-center'>
              <Calendar className='w-5 h-5 text-blue-500 mr-2' />
              <Typography variant='h6' className='text-blue-500'>
                {day.date}
              </Typography>
            </Box>
            <PenSquare className='w-5 h-5 text-blue-500 cursor-pointer' onClick={() => onEdit(dayIndex)} />
          </Box>

          <List>
            {day.timeSlots.map((slot, slotIndex) => (
              <React.Fragment key={slotIndex}>
                <ListItem className='py-4'>
                  <ListItemIcon>
                    <Timer className='text-gray-600' />
                  </ListItemIcon>

                  <ListItemText
                    primary={slot.time}
                    secondary={
                      <Box className='flex items-center mt-1'>
                        <User className='w-4 h-4 mr-1' />
                        <span>Capacity: {slot.capacity}</span>
                      </Box>
                    }
                  />

                  <Switch
                    edge='end'
                    checked={slots[dayIndex].timeSlots[slotIndex].active}
                    onChange={() => onSwitchChange(dayIndex, slotIndex)}
                  />
                </ListItem>
                {slotIndex < day.timeSlots.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          {dayIndex < slots.length - 1 && <Divider className='my-4' />}
        </Box>
      ))}
    </>
  )
}

export default SlotList
