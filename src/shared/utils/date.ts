const EXCEL_DATE_ORIGIN_UTC = Date.UTC(1899, 11, 30)
const MILLISECONDS_PER_DAY = 86_400_000

// Formats a Date object into a YYYY-MM-DD string in local time.
export const formatDateToIso = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Converts an Excel serial date to ISO when it is in a plausible date range.
const fromExcelSerial = (value: number): string | null => {
  if (!Number.isFinite(value) || value < 1 || value > 90_000) {
    return null
  }

  const date = new Date(EXCEL_DATE_ORIGIN_UTC + value * MILLISECONDS_PER_DAY)
  return formatDateToIso(date)
}

// Converts common date representations to a normalized ISO date.
export const toIsoDate = (value: unknown): string | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateToIso(value)
  }

  if (typeof value === 'number') {
    return fromExcelSerial(value)
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return null
  }

  // Keeps native ISO values stable without timezone shifts.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue
  }

  // Supports numeric Excel serial values represented as strings.
  if (/^\d+(\.\d+)?$/.test(trimmedValue)) {
    return fromExcelSerial(Number(trimmedValue))
  }

  // Supports DD/MM/YYYY input written manually in filter inputs.
  const ddmmyyyy = trimmedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy
    return `${year}-${month}-${day}`
  }

  const parsedDate = new Date(trimmedValue)
  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return formatDateToIso(parsedDate)
}

// Validates if target date is inside the start/end date range.
export const isDateWithinRange = (
  targetIso: string,
  startIso: string,
  endIso: string,
): boolean => {
  return targetIso >= startIso && targetIso <= endIso
}

// Returns current browser date in ISO format.
export const getTodayIso = (): string => {
  return formatDateToIso(new Date())
}
