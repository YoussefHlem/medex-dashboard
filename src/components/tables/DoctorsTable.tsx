'use client' // React Imports
import { useEffect, useMemo, useState } from 'react' // Next Imports

import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
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

import { toast } from 'react-toastify'

import { Box } from '@mui/material'

import Switch from '@mui/material/Switch'

import TablePaginationComponent from '@components/TablePaginationComponent'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { doctorsService } from '@/apis/services/doctors'
import { specialitiesService } from '@/apis/services/specialities'

interface DoctorType {
  id: string
  name: string
  type: string
  cover: string
  lat: number
  lng: number
  status: string
  speciality_id: string
  experience: number
  consultation_fee: number
  rating: number
  created_at: string
  updated_at: string
}

type DoctorTypeWithAction = DoctorType & {
  action?: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
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
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions
const columnHelper = createColumnHelper<DoctorTypeWithAction>()

const ListTable = () => {
  // States
  const [status, setStatus] = useState<DoctorType['status']>('')
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [specialities, setSpecialities] = useState([])

  useEffect(() => {}, [])

  const fetchDoctors = () => {
    doctorsService.listDoctors().then(res => {
      setData(res.data.doctors)
    })
    specialitiesService.listSpecialities().then(res => {
      setSpecialities(res.data.specialities)
    })
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleDelete = async id => {
    await toast.promise(doctorsService.deleteDoctor(id), {
      pending: 'Promise is pending',
      success: 'Promise resolved 👌',
      error: 'Promise rejected 🤯'
    })
    setData(data?.filter(doctor => doctor.id !== id))
  }

  // @ts-ignore
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
      columnHelper.accessor('speciality_id', {
        header: 'Speciality',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {specialities.find(item => item.id === row.original.speciality_id).name}
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
      columnHelper.accessor('rating', {
        header: 'Rating',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.rating}
          </Typography>
        )
      }),

      columnHelper.accessor('created_at', {
        header: 'Created At',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(
              new Date(row.original.created_at)
            )}
          </Typography>
        )
      }),
      columnHelper.accessor('updated_at', {
        header: 'Updated At',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(
              new Date(row.original.updated_at)
            )}
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
              <Link href={`/doctors/edit/${row.original.id}`} className='flex'>
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

  const table = useReactTable({
    data: filteredData as DoctorType[],
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
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
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

  useEffect(() => {
    const filteredData = data?.filter(item => {
      if (status && item.status.toLowerCase().replace(/\s+/g, '-') !== status) return false

      return true
    })

    setFilteredData(filteredData)
  }, [status, data, setFilteredData])

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
          <Button
            variant='contained'
            component={Link}
            startIcon={<i className='tabler-plus' />}
            href={'doctors/add'}
            className='max-sm:is-full'
          >
            Create Doctor
          </Button>
        </div>
        <div className='flex max-sm:flex-col max-sm:is-full sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
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
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>Doctor Status</MenuItem>
            <MenuItem value='inactive'>In Active</MenuItem>
            <MenuItem value='active'>Active</MenuItem>
          </CustomTextField>
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

export default ListTable
