'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import { Box, FormControl, Select } from '@mui/material'
import Chip from '@mui/material/Chip'
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import DataTable from '@components/table/DataTable'
import { TableHeader } from '@components/table/TableHeader'

import { isntallmentsService } from '@/apis/services/installments'

// Status enum and colors remain the same as in the original file
export enum Status {
  PENDING = 1,
  CONFIRMED = 2,
  PAID = 3,
  COMPLETED = 4,
  CANCELLED = 5
}

export const StatusColors: Record<Status, 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error'> = {
  [Status.PENDING]: 'warning',
  [Status.CONFIRMED]: 'info',
  [Status.PAID]: 'primary',
  [Status.COMPLETED]: 'success',
  [Status.CANCELLED]: 'error'
}

interface InstallmentType {
  id: number
  user: string
  hospital: string | null
  speciality: string
  status: string
  note: string | null
}

type InstallmentTypeWithAction = InstallmentType & {
  action?: string
}

const columnHelper = createColumnHelper<InstallmentTypeWithAction>()

const InstallmentsTable = () => {
  const [data, setData] = useState<InstallmentType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [pageIndex, setPageIndex] = useState(0)

  const fetchInstallments = () => {
    isntallmentsService.listInstallments().then(response => {
      setData(response.data.installments)
    })
  }

  useEffect(() => {
    fetchInstallments()
  }, [])

  const handleStatusUpdate = async (id: number, newStatus: Status) => {
    try {
      await isntallmentsService.updateInstallmentStatus(id, newStatus)
      fetchInstallments()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update installment status')
    }
  }

  const columns = useMemo<ColumnDef<InstallmentTypeWithAction, any>[]>(
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
      columnHelper.accessor('user', {
        header: 'User',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.user}
          </Typography>
        )
      }),
      columnHelper.accessor('hospital', {
        header: 'Hospital',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.hospital || 'N/A'}
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
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const currentStatus = row.original.status.toUpperCase()
          const statusValue = Status[currentStatus as keyof typeof Status] || Status.PENDING

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label={row.original.status} color={StatusColors[statusValue]} size='small' variant='filled' />
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <Select
                  value={statusValue}
                  onChange={e => handleStatusUpdate(row.original.id, e.target.value as Status)}
                  variant='outlined'
                  size='small'
                >
                  <MenuItem value={Status.PENDING}>Pending</MenuItem>
                  <MenuItem value={Status.CONFIRMED}>Confirmed</MenuItem>
                  <MenuItem value={Status.PAID}>Paid</MenuItem>
                  <MenuItem value={Status.COMPLETED}>Completed</MenuItem>
                  <MenuItem value={Status.CANCELLED}>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )
        }
      }),
      columnHelper.accessor('note', {
        header: 'Note',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.note || 'N/A'}
          </Typography>
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
        searchPlaceholder='Search Installment'
        createButtonProps={{
          href: '/installments/create',
          label: 'Create Installment'
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

export default InstallmentsTable
