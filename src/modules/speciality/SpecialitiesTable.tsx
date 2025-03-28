'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'react-toastify'

// Component Imports
import DataTable from '@components/table/DataTable'
import { TableHeader } from '@components/table/TableHeader'

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

const columnHelper = createColumnHelper<SpecialityTypeWithAction>()

const SpecialitiesTable = () => {
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
      <TableHeader
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        pageSize={pageSize}
        setPageSize={setPageSize}
        searchPlaceholder='Search Specialty'
        createButtonProps={{
          href: '/speciality/add',
          label: 'Create Speciality'
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

export default SpecialitiesTable
