import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (userType: 'admin' | 'doctor' | 'hospital' | null): VerticalMenuDataType[] => {
  switch (userType) {
    case 'admin':
      return [
        { label: 'Hospital/Clinic', href: '/admin/hospitals', icon: 'tabler-building-hospital' },
        { label: 'Doctors', href: '/admin/doctors', icon: 'tabler-stethoscope' },
        { label: 'Speciality', href: '/admin/speciality', icon: 'tabler-medical-cross' },
        { label: 'Patient', href: '/admin/patient', icon: 'tabler-user' },
        { label: 'Installment', href: '/admin/installment', icon: 'tabler-cash' }
      ]
    case 'doctor':
      return [
        { label: 'Profile', href: '/doctor/profile', icon: 'tabler-user' },
        { label: 'Agenda', href: '/doctor/agenda', icon: 'tabler-calendar' },
        { label: 'Schedule', href: '/doctor/schedule', icon: 'tabler-box' },
        { label: 'Booking', href: '/doctor/booking', icon: 'tabler-book' }
      ]
    case 'hospital':
      return [
        { label: 'Profile', href: '/doctor/profile', icon: 'tabler-user' },
        { label: 'Installment', href: '/hospital/installment', icon: 'tabler-cash' }
      ]
    default:
      return []
  }
}

export default verticalMenuData
