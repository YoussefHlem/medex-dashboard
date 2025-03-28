// DoctorsTable.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import { Box } from '@mui/material'
import Switch from '@mui/material/Switch'

// Third-party Imports
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DataTable from '@components/table/DataTable'

// Service Import
import { doctorsService } from '@/apis/services/doctors'

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

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.ComponentProps<typeof CustomTextField>, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
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

          const handleStatusChange = event => {
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
      <CardContent className='flex justify-between flex-col items-start md:items-center md:flex-row gap-4'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <Typography className='hidden sm:block'>Show</Typography>
            <CustomTextField
              select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className='is-[70px] max-sm:is-full'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
          </div>
          <Button
            variant='contained'
            component={Link}
            startIcon={<i className='tabler-plus' />}
            href='doctors/add'
            className='max-sm:is-full'
          >
            Create Doctor
          </Button>
        </div>
        <div className='flex max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Doctor'
            className='max-sm:is-full sm:is-[250px]'
          />
          <CustomTextField
            select
            id='select-status'
            value={status}
            onChange={e => setStatus(e.target.value)}
            className='max-sm:is-full sm:is-[160px]'
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Doctor Status</MenuItem>
            <MenuItem value='inactive'>In Active</MenuItem>
            <MenuItem value='active'>Active</MenuItem>
          </CustomTextField>
        </div>
      </CardContent>
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
