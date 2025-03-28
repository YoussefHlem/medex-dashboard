import React from 'react'

import Grid from '@mui/material/Grid2'

import CustomTextField from '@core/components/mui/TextField'

interface MultiLanguageTextFieldProps {
  formik: any
  languages: { id: string; label: string }[]
  name: string
  onLanguageChange: (langId: string, value: string) => void
  placeholder?: string
}

export const MultiLanguageTextField: React.FC<MultiLanguageTextFieldProps> = ({
  formik,
  languages,
  name,
  onLanguageChange,
  placeholder
}) => {
  return (
    <Grid container spacing={2}>
      {languages.map(lang => (
        <Grid key={lang.id} size={{ xs: 12, md: 6 }}>
          <CustomTextField
            fullWidth
            name={`${name}-${lang.id}`}
            label={`${name} (${lang.label})`}
            placeholder={placeholder}
            value={formik.values[name].find((item: any) => item.langId === lang.id)?.value || ''}
            onChange={e => onLanguageChange(lang.id, e.target.value)}
            onBlur={formik.handleBlur}
            error={formik.touched[name] && Boolean(formik.errors[name])}
            helperText={formik.touched[name] && typeof formik.errors[name] === 'string' ? formik.errors[name] : ''}
          />
        </Grid>
      ))}
    </Grid>
  )
}
