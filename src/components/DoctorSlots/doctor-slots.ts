export interface TimeSlot {
  id?: number
  time: string
  capacity: number
  active: boolean
}

export interface Slot {
  date: string // Format: "EEEE, MMMM d, yyyy"
  timeSlots: TimeSlot[]
}

export interface FormSlot {
  startTime: Date
  endTime: Date
  capacity: string
  id?: number
}

export interface FormData {
  date: Date
  slots: FormSlot[]
}
