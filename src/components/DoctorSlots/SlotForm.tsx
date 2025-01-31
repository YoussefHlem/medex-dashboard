import React from 'react'

import { Box, Button } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Plus } from 'lucide-react'

import type { FormData } from '@components/DoctorSlots/doctor-slots'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@core/components/mui/TextField'

interface SlotFormProps {
  formData: FormData
  onSubmit: (e: React.FormEvent) => void
  onDateChange: (date: Date) => void
  onTimeChange: (index: number, field: 'startTime' | 'endTime', date: Date) => void
  onCapacityChange: (index: number, value: string) => void
  onAddSlot: () => void
  onRemoveSlot: (index: number) => void
}

const SlotForm: React.FC<SlotFormProps> = ({
  formData,
  onSubmit,
  onDateChange,
  onTimeChange,
  onCapacityChange,
  onAddSlot,
  onRemoveSlot
}) => {
  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <AppReactDatepicker
            selected={formData.date}
            onChange={date => onDateChange(date as Date)}
            dateFormat='MM/dd/yyyy'
            customInput={<CustomTextField label='Date' fullWidth />}
          />
        </Grid>
      </Grid>

      {formData.slots.map((slot, index) => (
        <Grid container spacing={6} key={index}>
          <Grid size={{ xs: 12, md: 4 }}>
            <AppReactDatepicker
              selected={slot.startTime}
              onChange={date => onTimeChange(index, 'startTime', date as Date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={60}
              dateFormat='h:mm aa'
              customInput={<CustomTextField label='Start Time' fullWidth />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AppReactDatepicker
              selected={slot.endTime}
              onChange={date => onTimeChange(index, 'endTime', date as Date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={60}
              dateFormat='h:mm aa'
              customInput={<CustomTextField label='End Time' fullWidth />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <CustomTextField
              label='Capacity'
              type='number'
              value={slot.capacity}
              onChange={e => onCapacityChange(index, e.target.value)}
              fullWidth
            />
          </Grid>
          {formData.slots.length > 1 && (
            <Grid size={{ xs: 12, md: 1 }} className={'mt-5'}>
              <Button variant='outlined' color='error' onClick={() => onRemoveSlot(index)}>
                Remove
              </Button>
            </Grid>
          )}
        </Grid>
      ))}

      <Box className='flex justify-between pt-8'>
        <Button type='button' variant='outlined' startIcon={<Plus />} onClick={onAddSlot}>
          Add Time Slot
        </Button>
        <Button
          type='submit'
          variant='contained'
          disabled={!formData.date || formData.slots.some(slot => !slot.startTime || !slot.endTime || !slot.capacity)}
        >
          {formData.date ? 'Update Slots' : 'Add Slots'}
        </Button>
      </Box>
    </form>
  )
}

export default SlotForm
