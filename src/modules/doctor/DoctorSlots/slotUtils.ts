import { format, parse, parseISO } from 'date-fns'

import type { Slot, FormData } from '@/modules/doctor/DoctorSlots/doctor-slots'

export const transformBackendData = (schedules: any[]): Slot[] => {
  return schedules.map(schedule => ({
    date: format(parseISO(schedule.date), 'EEEE, MMMM d, yyyy'),
    timeSlots: schedule.slots.map(transformSlot)
  }))
}

const transformSlot = (slot: any) => ({
  time: `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`,
  capacity: slot.slot_capacity,
  active: slot.is_active ?? false,
  id: slot.id
})

export const transformToBackendFormat = (slots: Slot[]): any[] => {
  return slots.map(slot => {
    const parsedDate = parse(slot.date, 'EEEE, MMMM d, yyyy', new Date())

    return {
      date: format(parsedDate, 'yyyy-MM-dd'),
      slots: slot.timeSlots.map(timeSlot => ({
        id: timeSlot.id,
        start_time: `${timeSlot.time.split(' - ')[0]}:00`,
        end_time: `${timeSlot.time.split(' - ')[1]}:00`,
        slot_capacity: Number(timeSlot.capacity),
        is_active: timeSlot.active
      }))
    }
  })
}

export const createNewSlot = (): FormData => ({
  date: new Date(),
  slots: [
    {
      startTime: new Date(),
      endTime: new Date(),
      capacity: '',
      id: undefined
    }
  ]
})

export const createSlotFromFormData = (formData: FormData): Slot => ({
  date: format(formData.date, 'EEEE, MMMM d, yyyy'),
  timeSlots: formData.slots.map(slot => ({
    time: `${format(slot.startTime, 'HH:mm')} - ${format(slot.endTime, 'HH:mm')}`,
    capacity: Number(slot.capacity),
    active: true,
    id: slot.id
  }))
})

export const updateSlotsState = (existingSlots: Slot[], newSlot: Slot): Slot[] => {
  const existingIndex = existingSlots.findIndex(s => s.date === newSlot.date)

  if (existingIndex !== -1) {
    const updated = [...existingSlots]

    updated[existingIndex] = newSlot

    return updated
  }

  return [...existingSlots, newSlot]
}
