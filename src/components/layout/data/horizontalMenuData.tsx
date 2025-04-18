// Type Imports
import type { HorizontalMenuDataType } from '@components/layout/data/menuTypes'

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

export default horizontalMenuData
