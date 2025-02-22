// @ts-nocheck
'use client'
import React from 'react'

import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import 'react-toastify/dist/ReactToastify.css'
import { Loader2 } from 'lucide-react'

import SlotForm from '@components/DoctorSlots/SlotForm'
import SlotList from '@components/DoctorSlots/SlotList'
import { useSlotsManagement } from '@components/DoctorSlots/use-slots-management'

const DoctorSlots = ({ id }: { id: number }) => {
  const { slots, isLoading, formData, handlers, isSaving } = useSlotsManagement(id)

  return (
    <div className='space-y-4'>
      <Paper className='p-4'>
        <Typography variant='h6' className='mb-4'>
          Add/Edit Slots
        </Typography>
        <SlotForm
          formData={formData}
          onSubmit={handlers.handleSubmit}
          onDateChange={handlers.handleDateChange}
          onTimeChange={handlers.handleTimeChange}
          onCapacityChange={handlers.handleCapacityChange}
          onAddSlot={handlers.handleAddSlot}
          onRemoveSlot={handlers.handleRemoveSlot}
          disabled={isLoading || isSaving}
        />
      </Paper>

      <Paper className='p-4'>
        {isLoading ? (
          <Loader2 />
        ) : (
          <SlotList
            slots={slots}
            onEdit={handlers.handleEdit}
            onSwitchChange={handlers.handleSwitchChange}
            disabled={isSaving}
          />
        )}
      </Paper>
    </div>
  )
}

export default DoctorSlots
