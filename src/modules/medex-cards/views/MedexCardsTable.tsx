'use client'

import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'

// Third-party Imports
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'

// Component Imports
import DataTable from '@components/table/DataTable'
import { TableHeader } from '@components/table/TableHeader'
import { medexCardsService } from '@/apis/services/cards'

// Types
interface MedexCardType {
  id: number
  name: string
  email: string
  phone: string | null
}

type MedexCardTypeWithAction = MedexCardType & {
  action?: string
}

const columnHelper = createColumnHelper<MedexCardTypeWithAction>()

const MedexCardsTable = () => {
  const [data, setData] = useState<MedexCardType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [pageIndex, setPageIndex] = useState(0)

  const fetchMedexCards = () => {
    medexCardsService.listMedexCards().then(res => {
      setData(res.data.discount_cards)
    })
  }

  useEffect(() => {
    fetchMedexCards()
  }, [])

  const columns = useMemo<ColumnDef<MedexCardTypeWithAction, any>[]>(
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
            {row.original.phone || 'N/A'}
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
        searchPlaceholder='Search Medex Cards'
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

export default MedexCardsTable
