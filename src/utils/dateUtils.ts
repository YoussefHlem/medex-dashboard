export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export const parseTimeToDate = (timeString: string): Date => {
  const date = new Date()
  const [hour, minute] = timeString.split(':')

  date.setHours(parseInt(hour), parseInt(minute))

return date
}
