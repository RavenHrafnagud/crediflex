import { useEffect, useState } from 'react'
import type { PromotionFilters, PromotionRecord, PromotionsDataset } from '../model/types'
import { getTodayIso, isDateWithinRange, toIsoDate } from '../../shared/utils/date'
import { normalizeText } from '../../shared/utils/text'

interface UsePromotionFiltersResult {
  filters: PromotionFilters
  showOnlyToday: boolean
  filteredRecords: PromotionRecord[]
  totalRecords: number
  setFilterValue: (header: string, value: string) => void
  setShowOnlyToday: (enabled: boolean) => void
  resetFilters: () => void
}

const DATE_HEADER_HINT = /(fecha|date|dt_|desde|hasta|inicio|fin)/i

// Creates empty filters for all visible columns.
const createInitialFilters = (headers: string[]): PromotionFilters => {
  const initialFilters: PromotionFilters = {}
  for (const header of headers) {
    initialFilters[header] = ''
  }
  return initialFilters
}

// Applies all active filters to one record.
const recordMatchesColumnFilters = (
  record: PromotionRecord,
  headers: string[],
  filters: PromotionFilters,
): boolean => {
  for (const header of headers) {
    const filterValue = (filters[header] ?? '').trim()
    if (!filterValue) {
      continue
    }

    const recordValue = record[header] ?? ''
    const isDateColumn = DATE_HEADER_HINT.test(header)

    if (isDateColumn) {
      const recordDate = toIsoDate(recordValue)
      const filterDate = toIsoDate(filterValue)

      if (!recordDate || !filterDate || recordDate !== filterDate) {
        return false
      }
      continue
    }

    if (!normalizeText(recordValue).includes(normalizeText(filterValue))) {
      return false
    }
  }

  return true
}

// Applies the default "active today" behavior using dt_desde/dt_hasta fields.
const recordMatchesTodayScope = (
  record: PromotionRecord,
  dataset: PromotionsDataset,
  showOnlyToday: boolean,
): boolean => {
  if (!showOnlyToday) {
    return true
  }

  const fromColumn = dataset.dateRangeColumns.from
  const toColumn = dataset.dateRangeColumns.to

  if (!fromColumn || !toColumn) {
    return true
  }

  const fromDate = toIsoDate(record[fromColumn])
  const toDate = toIsoDate(record[toColumn])

  if (!fromDate || !toDate) {
    return false
  }

  return isDateWithinRange(getTodayIso(), fromDate, toDate)
}

// Manages dynamic filters for every column and computes filtered rows.
export const usePromotionFilters = (
  dataset: PromotionsDataset | null,
): UsePromotionFiltersResult => {
  const [filters, setFilters] = useState<PromotionFilters>({})
  const [showOnlyToday, setShowOnlyToday] = useState<boolean>(true)

  useEffect(() => {
    if (!dataset) {
      setFilters({})
      return
    }

    setFilters(createInitialFilters(dataset.headers))
    setShowOnlyToday(true)
  }, [dataset])

  const setFilterValue = (header: string, value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [header]: value,
    }))
  }

  const resetFilters = () => {
    if (!dataset) {
      return
    }

    setFilters(createInitialFilters(dataset.headers))
    setShowOnlyToday(true)
  }

  const filteredRecords = dataset
    ? dataset.records.filter((record) => {
        if (!recordMatchesTodayScope(record, dataset, showOnlyToday)) {
          return false
        }

        return recordMatchesColumnFilters(record, dataset.headers, filters)
      })
    : []

  return {
    filters,
    showOnlyToday,
    filteredRecords,
    totalRecords: dataset?.records.length ?? 0,
    setFilterValue,
    setShowOnlyToday,
    resetFilters,
  }
}
