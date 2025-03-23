export const appendMultilingualFields = (
  formData: FormData,
  fieldName: string,
  nameArray: { langId: string; value: string }[]
) => {
  nameArray.forEach((item, index) => {
    Object.keys(item).forEach(key => {
      formData.append(`${fieldName}[${index}][${key}]`, item[key as keyof typeof item])
    })
  })
}

export const appendOtherFields = (formData: FormData, values: Record<string, any>, excludeKeys: string[] = []) => {
  Object.keys(values).forEach(key => {
    if (!excludeKeys.includes(key) && values[key] !== null && key !== 'name') {
      formData.append(key, values[key])
    }
  })
}
