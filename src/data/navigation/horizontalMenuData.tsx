// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
  {
    label: 'Hospital/Clinic',
    href: '/hospitals',
    icon: 'tabler-building-hospital'
  },
  {
    label: 'Doctors',
    href: '/doctors',
    icon: 'tabler-stethoscope'
  },
  {
    label: 'Speciality',
    href: '/speciality',
    icon: 'tabler-medical-cross'
  },
  {
    label: 'Announcement',
    href: '/announcement',
    icon: 'tabler-megaphone'
  },
  {
    label: 'Agenda',
    href: '/agenda',
    icon: 'tabler-calendar'
  },
  {
    label: 'Booking',
    href: '/booking',
    icon: 'tabler-calendar-plus'
  },
  {
    label: 'Patient',
    href: '/patient',
    icon: 'tabler-user'
  },
  {
    label: 'Notification',
    href: '/notification',
    icon: 'tabler-bell'
  },
  {
    label: 'Installment',
    href: '/installment',
    icon: 'tabler-cash'
  }
]

export default horizontalMenuData
