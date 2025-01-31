'use client'
import React, { useState } from 'react'

import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import type { FormData, Slot } from '@components/DoctorSlots/doctor-slots'
import { formatDate, formatTime, parseTimeToDate } from '@/utils/dateUtils'
import SlotForm from '@components/DoctorSlots/SlotForm'
import SlotList from '@components/DoctorSlots/SlotList'

const DoctorSlots = () => {
  const [slots, setSlots] = useState<Slot[]>([
    {
      date: 'Wednesday, March 20, 2024',
      timeSlots: [
        { time: '09:00 - 10:00', capacity: 10, active: true },
        { time: '10:00 - 11:00', capacity: 8, active: false }
      ]
    },
    {
      date: 'Thursday, March 21, 2024',
      timeSlots: [
        { time: '09:00 - 10:00', capacity: 12, active: true },
        { time: '10:00 - 11:00', capacity: 15, active: true }
      ]
    }
  ])

  const [formData, setFormData] = useState<FormData>({
    date: new Date(),
    slots: [{ startTime: new Date(), endTime: new Date(), capacity: '' }]
  })

  const handleSwitchChange = (dayIndex: number, slotIndex: number) => {
    const newSlots = [...slots]

    newSlots[dayIndex].timeSlots[slotIndex].active = !newSlots[dayIndex].timeSlots[slotIndex].active
    setSlots(newSlots)
  }

  const handleEdit = (dayIndex: number) => {
    const day = slots[dayIndex]

    const formattedSlots = day.timeSlots.map(slot => {
      const [startTime, endTime] = slot.time.split(' - ')

      return {
        startTime: parseTimeToDate(startTime),
        endTime: parseTimeToDate(endTime),
        capacity: slot.capacity.toString()
      }
    })

    setFormData({
      date: new Date(day.date),
      slots: formattedSlots
    })
  }

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', date: Date) => {
    const newSlots = [...formData.slots]

    newSlots[index][field] = date
    setFormData(prev => ({ ...prev, slots: newSlots }))
  }

  const handleCapacityChange = (index: number, value: string) => {
    const newSlots = [...formData.slots]

    newSlots[index].capacity = value
    setFormData(prev => ({ ...prev, slots: newSlots }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newSlot = {
      date: formatDate(formData.date),
      timeSlots: formData.slots.map(slot => ({
        time: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
        capacity: parseInt(slot.capacity),
        active: true
      }))
    }

    const existingIndex = slots.findIndex(slot => slot.date === newSlot.date)

    if (existingIndex !== -1) {
      const newSlots = [...slots]

      newSlots[existingIndex] = newSlot
      setSlots(newSlots)
    } else {
      setSlots([...slots, newSlot])
    }

    setFormData({
      date: new Date(),
      slots: [{ startTime: new Date(), endTime: new Date(), capacity: '' }]
    })
  }

  return (
    <div className='space-y-4'>
      <Paper className='p-4'>
        <Typography variant='h6' className='mb-4'>
          Add/Edit Slots
        </Typography>
        <SlotForm
          formData={formData}
          onSubmit={handleSubmit}
          onDateChange={date => setFormData(prev => ({ ...prev, date }))}
          onTimeChange={handleTimeChange}
          onCapacityChange={handleCapacityChange}
          onAddSlot={() =>
            setFormData(prev => ({
              ...prev,
              slots: [...prev.slots, { startTime: new Date(), endTime: new Date(), capacity: '' }]
            }))
          }
          onRemoveSlot={index =>
            setFormData(prev => ({
              ...prev,
              slots: prev.slots.filter((_, i) => i !== index)
            }))
          }
        />
      </Paper>

      <Paper className='p-4'>
        <SlotList slots={slots} onEdit={handleEdit} onSwitchChange={handleSwitchChange} />
      </Paper>
    </div>
  )
}

export default DoctorSlots
