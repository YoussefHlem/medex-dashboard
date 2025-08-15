// @ts-nocheck
import { useState, useEffect, useCallback } from 'react'

import { toast } from 'react-toastify'

import { parse } from 'date-fns'

import { doctorsService } from '@/apis/services/doctors'

import type { Slot } from '@/modules/doctor/DoctorSlots/doctor-slots'
import {
  updateSlotsState,
  transformBackendData,
  transformToBackendFormat,
  createNewSlot,
  createSlotFromFormData
} from '@/modules/doctor/DoctorSlots/slotUtils'

export const useSlotsManagement = (id: number) => {
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>(createNewSlot())

  const fetchSlots = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await doctorsService.listSlots(id)

      if (response.data.isSuccess) {
        setSlots(transformBackendData(response.data.schedules))
      }
    } catch (error) {
      handleError(error, 'Error fetching slots')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveSlots = useCallback(
    async (slotsToSave: Slot[]) => {
      try {
        setIsSaving(true)
        const backendData = transformToBackendFormat(slotsToSave)

        const response = await doctorsService.updateSlots(id, {
          slots: backendData,
          _method: 'put'
        })

        if (response.status === 'Request Was Successful') {
          toast.success('Slots updated successfully')
        } else {
          throw new Error('Failed to save slots')
        }
      } catch (error) {
        handleError(error, 'Error updating slots')
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [id]
  )

  const handleEdit = useCallback(
    (dayIndex: number) => {
      const day = slots[dayIndex]

      const formattedSlots = day.timeSlots.map(slot => {
        const [start, end] = slot.time.split(' - ')

        return {
          startTime: parse(start, 'HH:mm', new Date()),
          endTime: parse(end, 'HH:mm', new Date()),
          capacity: slot.capacity.toString(),
          id: slot.id
        }
      })

      setFormData({
        date: parse(day.date, 'EEEE, MMMM d, yyyy', new Date()),
        slots: formattedSlots
      })
      toast.info(`Now editing slots for ${day.date}`)
    },
    [slots]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const newSlot = createSlotFromFormData(formData)
      const updatedSlots = updateSlotsState(slots, newSlot)

      try {
        await saveSlots(updatedSlots)
        setSlots(updatedSlots)
        setFormData(createNewSlot())
      } catch (error) {
        // Error is already handled in saveSlots
      }
    },
    [formData, slots, saveSlots]
  )

  const handleSwitchChange = useCallback(
    async (dayIndex: number, slotIndex: number) => {
      const updatedSlots = [...slots]

      updatedSlots[dayIndex].timeSlots[slotIndex].active = !updatedSlots[dayIndex].timeSlots[slotIndex].active

      try {
        await saveSlots(updatedSlots)
        setSlots(updatedSlots)
      } catch (error) {
        // Error is already handled in saveSlots, no need to revert state since it wasn't updated yet
      }
    },
    [slots, saveSlots]
  )

  // Form handlers
  const handleDateChange = useCallback((date: Date) => {
    setFormData(prev => ({ ...prev, date }))
  }, [])

  const handleTimeChange = useCallback((index: number, field: 'startTime' | 'endTime', date: Date) => {
    setFormData(prev => {
      const newSlots = [...prev.slots]

      newSlots[index][field] = date

      return { ...prev, slots: newSlots }
    })
  }, [])

  const handleCapacityChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const newSlots = [...prev.slots]

      newSlots[index].capacity = value

      return { ...prev, slots: newSlots }
    })
  }, [])

  const handleAddSlot = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      slots: [
        ...prev.slots,
        {
          startTime: new Date(),
          endTime: new Date(),
          capacity: '',
          id: undefined
        }
      ]
    }))
  }, [])

  const handleRemoveSlot = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index)
    }))
  }, [])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  return {
    slots,
    isLoading,
    formData,
    isSaving,
    handlers: {
      handleSubmit,
      handleDateChange,
      handleTimeChange,
      handleCapacityChange,
      handleAddSlot,
      handleRemoveSlot,
      handleEdit,
      handleSwitchChange
    },
    setFormData
  }
}

const handleError = (error: unknown, message: string) => {
  console.error(`${message}:`, error)
  toast.error(`${message}: ${error instanceof Error ? error.message : 'Unknown error'}`)
}
