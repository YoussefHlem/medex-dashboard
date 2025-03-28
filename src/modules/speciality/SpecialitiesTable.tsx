'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import type { TextFieldProps } from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DataTable from '@components/table/DataTable'

// Service Import
import { specialitiesService } from '@/apis/services/specialities'

interface SpecialityType {
  id: string
  name: string | { langId: string; value: string }[]
  description: string | { langId: string; value: string }[]
  cover: string
  created_at: string
  updated_at: string
}

type SpecialityTypeWithAction = SpecialityType & {
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
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper<SpecialityTypeWithAction>()

const ListTable = () => {
  const [data, setData] = useState<SpecialityType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [pageIndex, setPageIndex] = useState(0)

  const fetchSpecialities = () => {
    specialitiesService.listSpecialities().then(res => {
      setData(res.data.specialities)
    })
  }

  useEffect(() => {
    fetchSpecialities()
  }, [])

  const handleDelete = async (id: string) => {
    await toast.promise(specialitiesService.deleteSpeciality(id), {
      pending: 'Promise is pending',
      success: 'Promise resolved 👌',
      error: 'Promise rejected 🤯'
    })
    fetchSpecialities()
  }

  const columns = useMemo<ColumnDef<SpecialityTypeWithAction, any>[]>(
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
        cell: ({ row }) => {
          const name = row.original.name

          if (Array.isArray(name)) {
            const english = name.find(n => n.langId === 'en')?.value || ''
            const arabic = name.find(n => n.langId === 'ar')?.value || ''

            return (
              <Typography className='font-medium' color='text.primary'>
                {english}, {arabic}
              </Typography>
            )
          }

          return (
            <Typography className='font-medium' color='text.primary'>
              {name}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => {
          const description = row.original.description

          if (Array.isArray(description)) {
            const english = description.find(n => n.langId === 'en')?.value || ''
            const arabic = description.find(n => n.langId === 'ar')?.value || ''

            return (
              <Typography className='font-medium' color='text.primary'>
                {english}, {arabic}
              </Typography>
            )
          }

          return (
            <Typography className='font-medium' color='text.primary'>
              {description}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('cover', {
        header: 'Cover',
        cell: ({ row }) => (
          <img
            src={row.original.cover}
            alt='Speciality Icon'
            style={{ width: 50, height: 50, borderRadius: '4px', objectFit: 'cover' }}
          />
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
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleDelete(row.original.id)}>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
            <IconButton>
              <Link href={`/admin/speciality/edit/${row.original.id}`} className='flex'>
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
            href='speciality/add'
            className='max-sm:is-full'
          >
            Create Speciality
          </Button>
        </div>
        <div className='flex max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Specialty'
            className='max-sm:is-full sm:is-[250px]'
          />
        </div>
      </CardContent>
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

export default ListTable
