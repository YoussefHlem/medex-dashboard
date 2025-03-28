export interface LanguageValue {
  langId: string
  value: string
}

export interface SpecialityType {
  id: string
  name: string | LanguageValue[]
  description: string | LanguageValue[]
  cover: string
  created_at: string
  updated_at: string
}

export type SpecialityTypeWithAction = SpecialityType & {
  action?: string
}

export interface SpecialtyFormValues {
  name: LanguageValue[]
  description: LanguageValue[]
  cover: File | string | null
}

export interface SpecialtyFormProps {
  id?: number
}
