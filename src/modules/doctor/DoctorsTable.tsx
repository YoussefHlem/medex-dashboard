// DoctorsTable.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import { Box } from '@mui/material'
import Switch from '@mui/material/Switch'

// Third-party Imports
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

// Component Imports
import DataTable from '@components/table/DataTable'

// Service Import
import { doctorsService } from '@/apis/services/doctors'
import { TableHeader } from '@components/table/TableHeader'

interface DoctorType {
  id: string
  name: string
  type: string
  cover: string
  lat: number
  lng: number
  status: string
  speciality: string
  experience: number
  consultation_fee: number
  rating: number
  created_at: string
  updated_at: string
}

type DoctorTypeWithAction = DoctorType & {
  action?: string
}

const columnHelper = createColumnHelper<DoctorTypeWithAction>()

const DoctorsTable = () => {
  const [status, setStatus] = useState<DoctorType['status']>('')
  const [data, setData] = useState<DoctorType[]>([])
  const [filteredData, setFilteredData] = useState<DoctorType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [pageIndex, setPageIndex] = useState(0)

  const fetchDoctors = () => {
    doctorsService.listDoctors().then(res => {
      setData(res.data.doctors)
    })
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleDelete = async (id: string) => {
    await toast.promise(doctorsService.deleteDoctor(id), {
      pending: 'Promise is pending',
      success: 'Promise resolved 👌',
      error: 'Promise rejected 🤯'
    })
    fetchDoctors()
  }

  const columns = useMemo<ColumnDef<DoctorTypeWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: 'Id',
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
      columnHelper.accessor('speciality', {
        header: 'Speciality',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.speciality}
          </Typography>
        )
      }),
      columnHelper.accessor('experience', {
        header: 'Experience',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.experience} years
          </Typography>
        )
      }),
      columnHelper.accessor('cover', {
        header: 'Cover',
        cell: ({ row }) => (
          <img
            src={row.original.cover}
            alt='Doctor profile'
            style={{ width: 50, height: 50, borderRadius: '4px', objectFit: 'cover' }}
          />
        )
      }),
      columnHelper.accessor('consultation_fee', {
        header: 'Fee',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            ${row.original.consultation_fee}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.status === 'Active'

          const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const newStatus = event.target.checked ? 'Active' : 'Inactive'

            doctorsService
              .activeDoctor({ id: row.original.id, status: newStatus.toLowerCase() })
              .then(() => {
                toast.success(`Doctor ${isActive ? 'deactivated' : 'activated'} successfully`)
                fetchDoctors()
              })
              .catch(error => {
                toast.error(`Failed to update doctor status: ${error.message}`)
              })
          }

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label={row.original.status} color={isActive ? 'success' : 'error'} size='small' variant='tonal' />
              <Switch checked={isActive} onChange={handleStatusChange} size='small' color='success' />
            </Box>
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleDelete(row.original.id)}>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
            <IconButton>
              <Link href={`/admin/doctors/edit/${row.original.id}`} className='flex'>
                <i className='tabler-pencil text-textSecondary' />
              </Link>
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    []
  )

  // Apply status filtering to the doctors data
  useEffect(() => {
    const filtered = data.filter(item => {
      return !(status && item.status.toLowerCase().replace(/\s+/g, '-') !== status)
    })

    setFilteredData(filtered)
  }, [status, data])

  return (
    <Card>
      <TableHeader
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        pageSize={pageSize}
        setPageSize={setPageSize}
        createButtonProps={{
          href: 'doctors/add',
          label: 'Create Doctor'
        }}
        searchPlaceholder='Search Doctor'
        filterProps={{
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ],
          value: status,
          onChange: setStatus,
          placeholder: 'Doctor Status'
        }}
      />
      <DataTable
        data={filteredData}
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

export default DoctorsTable
