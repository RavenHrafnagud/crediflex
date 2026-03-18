import * as XLSX from 'xlsx'
import {
  CODPROM_DESCRIPTION_CANDIDATES,
  CODPROM_DESCRIPTION_COLUMN,
  CODPROM_HEADER_CANDIDATES,
  CODPROM_NAME_CANDIDATES,
  CODPROM_NAME_COLUMN,
  DATE_FROM_HEADER_CANDIDATES,
  DATE_TO_HEADER_CANDIDATES,
} from '../model/constants'
import type { CodpromMeaning, PromotionRecord, PromotionsDataset } from '../model/types'
import { formatDateToIso } from '../../shared/utils/date'
import { normalizeText } from '../../shared/utils/text'

type SheetCell = string | number | boolean | Date | null | undefined

// Normalizes sheet cell values to string to simplify rendering and filtering.
const normalizeCell = (value: SheetCell): string => {
  if (value === null || value === undefined) {
    return ''
  }

  if (value instanceof Date) {
    return formatDateToIso(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  return `${value}`.trim()
}

// Reads one sheet as matrix preserving empty cells.
const readSheetRows = (sheet: XLSX.WorkSheet): string[][] => {
  const rows = XLSX.utils.sheet_to_json<SheetCell[]>(sheet, {
    header: 1,
    raw: true,
    defval: '',
  })

  return rows.map((row) => row.map((cell) => normalizeCell(cell)))
}

// Generates stable, non-empty and unique headers from row zero.
const buildHeaders = (headerRow: string[]): string[] => {
  const counters = new Map<string, number>()

  return headerRow.map((rawHeader, index) => {
    const baseHeader = rawHeader.trim() || `columna_${index + 1}`
    const key = normalizeText(baseHeader)
    const currentCount = (counters.get(key) ?? 0) + 1
    counters.set(key, currentCount)
    return currentCount === 1 ? baseHeader : `${baseHeader}_${currentCount}`
  })
}

// Converts a matrix into objects keyed by header names.
const rowsToRecords = (rows: string[][], headers: string[]): PromotionRecord[] => {
  const records: PromotionRecord[] = []

  for (const row of rows.slice(1)) {
    const record: PromotionRecord = {}
    let hasAnyValue = false

    headers.forEach((header, index) => {
      const cellValue = row[index] ?? ''
      if (cellValue !== '') {
        hasAnyValue = true
      }
      record[header] = cellValue
    })

    if (hasAnyValue) {
      records.push(record)
    }
  }

  return records
}

// Finds a header using normalized exact or partial matching.
const findHeader = (headers: string[], candidates: string[]): string | undefined => {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeText(header),
  }))

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeText(candidate)

    const exactMatch = normalizedHeaders.find(
      (header) => header.normalized === normalizedCandidate,
    )
    if (exactMatch) {
      return exactMatch.original
    }

    const partialMatch = normalizedHeaders.find((header) =>
      header.normalized.includes(normalizedCandidate),
    )
    if (partialMatch) {
      return partialMatch.original
    }
  }

  return undefined
}

// Builds dictionary for codprom metadata from the configuration sheet.
const buildCodpromMeanings = (
  configHeaders: string[],
  configRecords: PromotionRecord[],
): Record<string, CodpromMeaning> => {
  const codpromHeader = findHeader(configHeaders, CODPROM_HEADER_CANDIDATES) ?? configHeaders[0]
  const nameHeader = findHeader(configHeaders, CODPROM_NAME_CANDIDATES)
  const descriptionHeader = findHeader(configHeaders, CODPROM_DESCRIPTION_CANDIDATES)

  const meanings: Record<string, CodpromMeaning> = {}

  for (const record of configRecords) {
    const code = (record[codpromHeader] ?? '').trim()
    if (!code) {
      continue
    }

    meanings[code] = {
      code,
      name: record[nameHeader ?? ''] ?? '',
      description: record[descriptionHeader ?? ''] ?? '',
      raw: record,
    }
  }

  return meanings
}

// Appends codprom metadata columns so they can be filtered like any other field.
const enrichRecordsWithCodprom = (
  headers: string[],
  records: PromotionRecord[],
  meanings: Record<string, CodpromMeaning>,
): { headers: string[]; records: PromotionRecord[] } => {
  const codpromHeader = findHeader(headers, CODPROM_HEADER_CANDIDATES)

  const nextHeaders = [...headers]
  if (!nextHeaders.includes(CODPROM_NAME_COLUMN)) {
    nextHeaders.push(CODPROM_NAME_COLUMN)
  }
  if (!nextHeaders.includes(CODPROM_DESCRIPTION_COLUMN)) {
    nextHeaders.push(CODPROM_DESCRIPTION_COLUMN)
  }

  const nextRecords = records.map((record) => {
    const codpromCode = codpromHeader ? (record[codpromHeader] ?? '').trim() : ''
    const codpromMeaning = codpromCode ? meanings[codpromCode] : undefined

    return {
      ...record,
      [CODPROM_NAME_COLUMN]: codpromMeaning?.name ?? '',
      [CODPROM_DESCRIPTION_COLUMN]: codpromMeaning?.description ?? '',
    }
  })

  return {
    headers: nextHeaders,
    records: nextRecords,
  }
}

// Returns date range columns used to apply default "active today" behavior.
const detectDateRangeColumns = (headers: string[]) => {
  const from = findHeader(headers, DATE_FROM_HEADER_CANDIDATES)
  const to = findHeader(headers, DATE_TO_HEADER_CANDIDATES)

  return { from, to }
}

// Parses a workbook binary source into the domain dataset model.
export const parseWorkbookBuffer = (
  sourceFileName: string,
  workbookBuffer: ArrayBuffer,
): PromotionsDataset => {
  const workbook = XLSX.read(workbookBuffer, { type: 'array', cellDates: true })

  if (workbook.SheetNames.length < 2) {
    throw new Error('El archivo debe tener al menos dos hojas: datos y configuracion.')
  }

  const dataSheetName = workbook.SheetNames[0]
  const configSheetName = workbook.SheetNames[1]
  const dataSheet = workbook.Sheets[dataSheetName]
  const configSheet = workbook.Sheets[configSheetName]

  if (!dataSheet || !configSheet) {
    throw new Error('No fue posible leer las dos hojas requeridas del archivo.')
  }

  const dataRows = readSheetRows(dataSheet)
  const configRows = readSheetRows(configSheet)

  if (dataRows.length < 2) {
    throw new Error('La hoja principal no contiene filas de datos.')
  }

  if (configRows.length < 2) {
    throw new Error('La hoja de configuracion no contiene definiciones de codprom.')
  }

  const baseHeaders = buildHeaders(dataRows[0])
  const baseRecords = rowsToRecords(dataRows, baseHeaders)

  const configHeaders = buildHeaders(configRows[0])
  const configRecords = rowsToRecords(configRows, configHeaders)
  const codpromMeanings = buildCodpromMeanings(configHeaders, configRecords)

  const enriched = enrichRecordsWithCodprom(baseHeaders, baseRecords, codpromMeanings)

  return {
    dataSheetName,
    configSheetName,
    headers: enriched.headers,
    records: enriched.records,
    codpromMeanings,
    dateRangeColumns: detectDateRangeColumns(enriched.headers),
    fileName: sourceFileName,
    loadedAtIso: new Date().toISOString(),
  }
}

// Parses a user-uploaded file into the domain dataset model.
export const parseWorkbookFile = async (file: File): Promise<PromotionsDataset> => {
  const buffer = await file.arrayBuffer()
  return parseWorkbookBuffer(file.name, buffer)
}
