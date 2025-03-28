'use client'

import { Box, FormControl, Select, MenuItem } from '@mui/material'
import Chip from '@mui/material/Chip'

import { Status, StatusColors } from '@/modules/installment/entities/installmentEntities'

interface InstallmentStatusSelectorProps {
  status: string
  id: number
  onStatusUpdate: (id: number, newStatus: Status) => void
}

export const InstallmentStatusSelector = ({ status, id, onStatusUpdate }: InstallmentStatusSelectorProps) => {
  const currentStatus = status.toUpperCase()
  const statusValue = Status[currentStatus as keyof typeof Status] || Status.PENDING

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Chip label={status} color={StatusColors[statusValue]} size='small' variant='filled' />
      <FormControl size='small' sx={{ minWidth: 120 }}>
        <Select
          value={statusValue}
          onChange={e => onStatusUpdate(id, e.target.value as Status)}
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
