'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

import DataTable from '@components/table/DataTable'
import { TableHeader } from '@components/table/TableHeader'

import { isntallmentsService } from '@/apis/services/installments'
import type {
  InstallmentType,
  InstallmentTypeWithAction,
  Status
} from '@/modules/installment/entities/installmentEntities'
import { InstallmentStatusSelector } from '@/modules/installment/components/InstallmentStatusSelector'

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
        cell: ({ row }) => (
          <InstallmentStatusSelector
            status={row.original.status}
            id={row.original.id}
            onStatusUpdate={handleStatusUpdate}
          />
        )
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
