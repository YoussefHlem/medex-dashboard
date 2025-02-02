'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Box, FormControl, Select } from '@mui/material'
import Chip from '@mui/material/Chip'

import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { isntallmentsService } from '@/apis/services/installments'

// Define status enum and type
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

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
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
} & Omit<TextFieldProps, 'onChange'>) => {
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

const columnHelper = createColumnHelper<InstallmentTypeWithAction>()

const InstallmentsTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<InstallmentType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')

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

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 25
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      <CardContent className='flex justify-between flex-col items-start md:items-center md:flex-row gap-4'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 is-full sm:is-auto'>
          <div className='flex items-center gap-2 is-full sm:is-auto'>
            <Typography className='hidden sm:block'>Show</Typography>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='is-[70px] max-sm:is-full'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
          </div>
        </div>
        <div className='flex max-sm:flex-col max-sm:is-full sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Installment'
            className='max-sm:is-full sm:is-[250px]'
          />
        </div>
      </CardContent>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i className='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
    </Card>
  )
}

export default InstallmentsTable
