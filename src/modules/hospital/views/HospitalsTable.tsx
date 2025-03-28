'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import { Box } from '@mui/material'
import Switch from '@mui/material/Switch'
import { toast } from 'react-toastify'
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'

import { hospitalsService } from '@/apis/services/hospitals'
import DataTable from '@components/table/DataTable'
import { TableHeader } from '@components/table/TableHeader'
import type { HospitalType } from '@/modules/hospital/entities/hospitalEntities'

type HospitalTypeWithAction = HospitalType & {
  action?: string
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

          const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  // Apply status filtering to the hospitals data
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
          href: 'hospitals/add',
          label: 'Create Hospital'
        }}
        searchPlaceholder='Search Hospital'
        filterProps={{
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ],
          value: status,
          onChange: setStatus,
          placeholder: 'Hospital Status'
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

export default HospitalsTable
