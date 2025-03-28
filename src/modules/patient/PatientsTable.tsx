'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Box } from '@mui/material'
import Chip from '@mui/material/Chip'
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'

import DataTable from '@components/table/DataTable'
import { TableHeader } from '@components/table/TableHeader'
import { patientsService } from '@/apis/services/patients'

interface PatientType {
  id: number
  name: string
  email: string
  phone: string
  status: string
}

type PatientTypeWithAction = PatientType & {
  action?: string
}

const columnHelper = createColumnHelper<PatientTypeWithAction>()

const PatientsTable = () => {
  const [data, setData] = useState<PatientType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [pageIndex, setPageIndex] = useState(0)

  const fetchPatients = () => {
    patientsService.listPatients().then(response => {
      setData(response.data.patients)
    })
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const columns = useMemo<ColumnDef<PatientTypeWithAction, any>[]>(
    () => [
      {
        id: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.id}
          </Typography>
        )
      },
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.email}
          </Typography>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.phone}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              label={row.original.status}
              color={row.original.status === 'Active' ? 'success' : 'error'}
              size='small'
              variant='tonal'
            />
          </Box>
        )
      })
    ],
    []
  )

  return (
    <Card>
      <TableHeader
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        pageSize={pageSize}
        setPageSize={setPageSize}
        searchPlaceholder='Search Patient'
        createButtonProps={{
          href: '/patients/create',
          label: 'Create Patient'
        }}
      />
      <DataTable
        data={data}
        columns={columns}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        pageSize={pageSize}
        setPageSize={setPageSize}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
      />
    </Card>
  )
}

export default PatientsTable
