'use client'
import { useState } from 'react'

import { Pagination, Paper } from '@mui/material'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { DataGrid } from '@mui/x-data-grid'

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'firstName', headerName: 'First name', width: 130 },
  { field: 'lastName', headerName: 'Last name', width: 130 },
  {
    field: 'age',
    headerName: 'Age',
    width: 90
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`
  }
]

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: 31 },
  { id: 6, lastName: 'Melisandre', firstName: 'John', age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 }
]

const initialPaginationModel = { page: 0, pageSize: 5 }

export default function DataTable() {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(initialPaginationModel)

  const totalPages = Math.ceil(rows.length / paginationModel.pageSize)

  const handlePaginationChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPaginationModel(prev => ({ ...prev, page: page - 1 }))
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
        hideFooterPagination
      />
      <div className='flex items-center justify-between p-4 pt-0'>
        <div className='text-sm text-gray-600'>
          Showing {paginationModel.page * paginationModel.pageSize + 1} to{' '}
          {Math.min((paginationModel.page + 1) * paginationModel.pageSize, rows.length)} of {rows.length} entries
        </div>
        <Pagination
          count={totalPages}
          page={paginationModel.page + 1}
          onChange={handlePaginationChange}
          variant='outlined'
          shape='rounded'
          color='primary'
          showFirstButton
          showLastButton
        />
      </div>
    </Paper>
  )
}
