export interface TimeSlot {
  time: string
  capacity: number
  active: boolean
}

export interface Slot {
  date: string
  timeSlots: TimeSlot[]
}

export interface FormSlot {
  startTime: Date
  endTime: Date
  capacity: string
}

export interface FormData {
  date: Date
  slots: FormSlot[]
}
