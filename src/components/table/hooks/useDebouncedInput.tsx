// @ts-nocheck
import { useState, useEffect } from 'react'

import type { TextFieldProps } from '@mui/material/TextField'

import CustomTextField from '@core/components/mui/TextField'

export function useDebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string
  onChange: (value: string) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) {
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

  return {
    value,
    setValue,
    DebouncedInputComponent: componentProps => (
      <CustomTextField {...props} {...componentProps} value={value} onChange={e => setValue(e.target.value)} />
    )
  }
}
