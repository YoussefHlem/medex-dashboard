import React from 'react'

import HospitalForm from '@components/forms/HospitalForm'

const HospitalDetails = async ({ params }: { params: Promise<{ id: number }> }) => {
  const id = (await params).id

  return <HospitalForm id={id} />
}

export default HospitalDetails
