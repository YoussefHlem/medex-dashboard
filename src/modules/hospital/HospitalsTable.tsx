// HospitalsTable.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import { Box } from '@mui/material'
import Switch from '@mui/material/Switch'
import { toast } from 'react-toastify'
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'

import CustomTextField from '@core/components/mui/TextField'
import { hospitalsService } from '@/apis/services/hospitals'
import DataTable from '@components/table/DataTable'

interface HospitalType {
  id: string
  name: string
  type: string
  cover: string
  lat: number
  lng: number
  status: string
}

type HospitalTypeWithAction = HospitalType & {
  action?: string
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper<HospitalTypeWithAction>()

const HospitalsTable = () => {
  const [status, setStatus] = useState<HospitalType['status']>('')
  const [data, setData] = useState<HospitalType[]>([])
  const [filteredData, setFilteredData] = useState<HospitalType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [pageIndex, setPageIndex] = useState(0)

  const fetchHospitals = () => {
    hospitalsService.listHospitals().then(res => {
      setData(res.data.hospitals)
    })
  }

  useEffect(() => {
    fetchHospitals()
  }, [])

  const handleDelete = async (id: string) => {
    await toast.promise(hospitalsService.deleteHospital(id), {
      pending: 'Promise is pending',
      success: 'Promise resolved 👌',
      error: 'Promise rejected 🤯'
    })
    fetchHospitals()
  }

  const columns = useMemo<ColumnDef<HospitalTypeWithAction, any>[]>(
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
      columnHelper.accessor('type', {
        header: 'Type',
        cell: ({ row }) => (
          <Chip
            label={row.original.type}
            color={row.original.type === 'Public' ? 'success' : 'default'}
            size='small'
            variant='outlined'
          />
        )
      }),
      columnHelper.accessor('cover', {
        header: 'Cover',
        cell: ({ row }) => (
          <img
            src={row.original.cover}
            alt={`${row.original.name} cover`}
            style={{ width: 50, height: 50, borderRadius: '4px', objectFit: 'cover' }}
          />
        )
      }),
      columnHelper.accessor('lat', {
        header: 'Latitude',
        cell: ({ row }) => <Typography>{row.original.lat}</Typography>
      }),
      columnHelper.accessor('lng', {
        header: 'Longitude',
        cell: ({ row }) => <Typography>{row.original.lng}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.status === 'Active'

          const handleStatusChange = event => {
            const newStatus = event.target.checked ? 'Active' : 'Inactive'

            hospitalsService
              .activeHospital({ id: row.original.id, status: newStatus.toLowerCase() })
              .then(() => {
                toast.success(`Hospital ${isActive ? 'deactivated' : 'activated'} successfully`)
                fetchHospitals()
              })
              .catch(error => {
                toast.error(`Failed to update hospital status: ${error.message}`)
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
              <Link href={`/admin/hospitals/edit/${row.original.id}`} className='flex'>
                <i className='tabler-pencil text-textSecondary' />
              </Link>
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [data]
  )

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
            href={'hospitals/add'}
            className='max-sm:is-full'
          >
            Create Hospital
          </Button>
        </div>
        <div className='flex max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Hospital'
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
            <MenuItem value=''>Hospital Status</MenuItem>
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

export default HospitalsTable
