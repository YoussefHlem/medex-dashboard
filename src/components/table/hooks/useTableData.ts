import { useState, useEffect } from 'react'

export function useTableData<T>(fetchFunction: () => Promise<{ data: { [key: string]: T[] } }>) {
  const [data, setData] = useState<T[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [pageIndex, setPageIndex] = useState(0)

  const fetchData = () => {
    fetchFunction().then(res => {
      const dataKey = Object.keys(res.data)[0]

      setData(res.data[dataKey])
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    globalFilter,
    setGlobalFilter,
    pageSize,
    setPageSize,
    pageIndex,
    setPageIndex,
    refetchData: fetchData
  }
}
