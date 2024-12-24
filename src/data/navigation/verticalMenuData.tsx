// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Home',
    href: '/home',
    icon: 'tabler-smart-home'
  },
  {
    label: 'Hospital/Clinic',
    href: '/hospital-clinic',
    icon: 'tabler-building-hospital'
  },
  {
    label: 'Doctor',
    href: '/doctor',
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
    icon: 'tabler-news'
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

export default verticalMenuData
