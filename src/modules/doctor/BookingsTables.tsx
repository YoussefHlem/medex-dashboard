// @ts-nocheck
'use client'
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { Box, FormControl, Select } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

// Component Imports
import DataTable from '@components/table/DataTable'

// Service Import
import { doctorsService } from '@/apis/services/doctors'
import { TableHeader } from '@components/table/TableHeader'

type Status = 'Approved' | 'Rejected' | 'Pending'

const StatusColors: Record<Status, 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error'> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error'
}

interface BookingType {
  id: number
  patient_id: number
  patient_name: string
  patient_email: string
  patient_phone: string
  booking_date: string
  status: Status
}

type BookingTypeWithAction = BookingType & {
  action?: string
}

const columnHelper = createColumnHelper<BookingTypeWithAction>()

const BookingsTable = ({ id }: { id: number }) => {
  const [data, setData] = useState<BookingType[]>([])
  const [filteredData, setFilteredData] = useState<BookingType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [pageIndex, setPageIndex] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    doctorsService.listBookings(id).then(res => {
      setData(res.data.bookings)
    })
  }, [id])

  // Apply status filtering to the bookings data
  useEffect(() => {
    const filtered = data.filter(item => {
      return !(statusFilter && item.status !== statusFilter)
    })

    setFilteredData(filtered)
  }, [statusFilter, data])

  const handleStatusChange = async (bookingId: number, newStatus: Status) => {
    try {
      // Don't make API call if status is pending
      if (newStatus === 'Pending') return

      const action = newStatus.toLowerCase()

      await doctorsService.updateBooking(id, bookingId, action)

      // Update local state after successful API call
      const updatedData = data.map(booking => (booking.id === bookingId ? { ...booking, status: newStatus } : booking))

      setData(updatedData)
      toast.success('Booking status updated successfully')
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    }
  }

  const columns = useMemo<ColumnDef<BookingTypeWithAction, any>[]>(
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
      columnHelper.accessor('patient_name', {
        header: 'Patient Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.patient_name}
          </Typography>
        )
      }),
      columnHelper.accessor('patient_email', {
        header: 'Patient Email',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.patient_email}
          </Typography>
        )
      }),
      columnHelper.accessor('patient_phone', {
        header: 'Patient Phone',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.patient_phone}
          </Typography>
        )
      }),
      columnHelper.accessor('booking_date', {
        header: 'Booking Date',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }).format(new Date(row.original.booking_date))}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const currentStatus = row.original.status

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label={currentStatus} color={StatusColors[currentStatus]} size='small' variant='filled' />
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <Select
                  value={currentStatus}
                  variant='outlined'
                  size='small'
                  onChange={e => handleStatusChange(row.original.id, e.target.value as Status)}
                >
                  <MenuItem value='Approved'>Approved</MenuItem>
                  <MenuItem disabled value='Pending'>
                    Pending
                  </MenuItem>
                  <MenuItem value='Rejected'>Rejected</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )
        }
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
        searchPlaceholder='Search Bookings'
        filterProps={{
          options: [
            { value: 'Approved', label: 'Approved' },
            { value: 'Rejected', label: 'Rejected' },
            { value: 'Pending', label: 'Pending' }
          ],
          value: statusFilter,
          onChange: setStatusFilter,
          placeholder: 'Booking Status'
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

export default BookingsTable
