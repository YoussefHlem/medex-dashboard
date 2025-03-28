export const createMultiLanguageFormData = (
  values: Record<string, any>,
  multiLanguageKeys: string[] = []
): FormData => {
  const formData = new FormData()

  // Handle multilingual fields
  multiLanguageKeys.forEach(key => {
    if (values[key] && Array.isArray(values[key])) {
      values[key].forEach((fieldObj: any, index: number) => {
        Object.keys(fieldObj).forEach(langKey => {
          formData.append(`${key}[${index}][${langKey}]`, fieldObj[langKey])
        })
      })
    }
  })

  // Handle other fields
  Object.keys(values).forEach(key => {
    // Skip multilingual keys
    if (!multiLanguageKeys.includes(key) && values[key] !== null && values[key] !== undefined) {
      // Handle file objects
      if (values[key] instanceof File) {
        formData.append(key, values[key])
      }

      // Handle other types
      else {
        formData.append(key, String(values[key]))
      }
    }
  })

  return formData
}

export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
