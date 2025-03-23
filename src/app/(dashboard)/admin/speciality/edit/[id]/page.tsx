import React from 'react'

import SpecialityForm from '@/modules/speciality/SpecialityForm'

const DoctorDetails = async ({ params }: { params: Promise<{ id: number }> }) => {
  const id = (await params).id

  return <SpecialityForm id={id} />
}

export default DoctorDetails
