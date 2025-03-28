export enum Status {
  PENDING = 1,
  CONFIRMED = 2,
  PAID = 3,
  COMPLETED = 4,
  CANCELLED = 5
}

export const StatusColors: Record<Status, 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error'> = {
  [Status.PENDING]: 'warning',
  [Status.CONFIRMED]: 'info',
  [Status.PAID]: 'primary',
  [Status.COMPLETED]: 'success',
  [Status.CANCELLED]: 'error'
}

export interface InstallmentType {
  id: number
  user: string
  hospital: string | null
  speciality: string
  status: string
  note: string | null
}

export type InstallmentTypeWithAction = InstallmentType & {
  action?: string
}
