import React from 'react'

import DoctorForm from '@components/forms/DoctorForm'

const DoctorDetails = async ({ params }: { params: Promise<{ id: number }> }) => {
  const id = (await params).id

  return <DoctorForm id={id} />
}

export default DoctorDetails
