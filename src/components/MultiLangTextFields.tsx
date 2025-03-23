import { Grid, InputAdornment } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'

interface Language {
  langId: string
  label: string
  placeholder?: string
  icon?: JSX.Element
}

interface MultiLangTextFieldsProps {
  languages: Language[]
  values: { langId: string; value: string }[]
  onChange: (langId: string, value: string) => void
  onBlur: (e: any) => void
  error?: boolean
  helperText?: string
}

const MultiLangTextFields = ({ languages, values, onChange, onBlur, error, helperText }: MultiLangTextFieldsProps) => {
  return (
    <>
      {languages.map((language, index) => {
        const valueObj = values.find(v => v.langId === language.langId) || { langId: language.langId, value: '' }

        return (
          <Grid item xs={12} md={6} key={language.langId}>
            <CustomTextField
              fullWidth
              name={`name.${index}.value`}
              label={language.label}
              placeholder={language.placeholder}
              value={valueObj.value}
              onChange={e => onChange(language.langId, e.target.value)}
              onBlur={onBlur}
              error={error}
              helperText={helperText}
              slotProps={{
                input: {
                  startAdornment: language.icon ? (
                    <InputAdornment position='start'>{language.icon}</InputAdornment>
                  ) : undefined
                }
              }}
            />
          </Grid>
        )
      })}
    </>
  )
}

export default MultiLangTextFields
