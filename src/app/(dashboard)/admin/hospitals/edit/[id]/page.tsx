import React from 'react'

import HospitalForm from '@/modules/hospital/HospitalForm'

const HospitalDetails = async ({ params }: { params: Promise<{ id: number }> }) => {
  const id = (await params).id

  return <HospitalForm id={id} />
}

export default HospitalDetails
