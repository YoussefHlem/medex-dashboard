import React from 'react'

import Index from '@/modules/hospital/views/HospitalForm'

const HospitalDetails = async ({ params }: { params: Promise<{ id: number }> }) => {
  const id = (await params).id

  return <Index id={id} />
}

export default HospitalDetails
