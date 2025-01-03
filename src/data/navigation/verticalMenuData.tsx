// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
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
    label: 'Installment',
    href: '/installment',
    icon: 'tabler-cash'
  }
]

export default verticalMenuData
