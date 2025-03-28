import React from 'react'

import Link from 'next/link'

import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'
import { useDebouncedInput } from '@components/table/hooks/useDebouncedInput'

interface TableHeaderProps {
  globalFilter: string
  setGlobalFilter: (value: string) => void
  pageSize: number
  setPageSize: (size: number) => void
  createButtonProps?: {
    href: string
    label: string
  }
  searchPlaceholder?: string
  filterProps?: {
    options: { value: string; label: string }[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  globalFilter,
  setGlobalFilter,
  pageSize,
  setPageSize,
  createButtonProps,
  searchPlaceholder = 'Search',
  filterProps
}) => {
  const { DebouncedInputComponent } = useDebouncedInput({
    value: globalFilter,
    onChange: setGlobalFilter
  })

  return (
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
        {createButtonProps && (
          <Button
            variant='contained'
            component={Link}
            startIcon={<i className='tabler-plus' />}
            href={createButtonProps.href}
            className='max-sm:is-full'
          >
            {createButtonProps.label}
          </Button>
        )}
      </div>
      <div className='flex max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInputComponent placeholder={`${searchPlaceholder}`} className='max-sm:is-full sm:is-[250px]' />

        {filterProps && (
          <CustomTextField
            select
            id='select-filter'
            value={filterProps.value}
            onChange={e => filterProps.onChange(e.target.value)}
            className='max-sm:is-full sm:is-[160px]'
            slotProps={{ select: { displayEmpty: true } }}
            placeholder={filterProps.placeholder}
          >
            <MenuItem value=''>{filterProps.placeholder || 'Select Filter'}</MenuItem>
            {filterProps.options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </CustomTextField>
        )}
      </div>
    </CardContent>
  )
}
