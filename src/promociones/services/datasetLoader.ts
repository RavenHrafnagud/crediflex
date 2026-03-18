import { DEFAULT_WORKBOOK_URL } from '../model/constants'
import type { PromotionsDataset } from '../model/types'
import { parseWorkbookBuffer } from './excelParser'

// Loads the bundled workbook when there is no user-uploaded dataset in storage.
export const loadDefaultDataset = async (): Promise<PromotionsDataset> => {
  const response = await fetch(DEFAULT_WORKBOOK_URL)
  if (!response.ok) {
    throw new Error(
      `No fue posible cargar el archivo inicial (${response.status} ${response.statusText}).`,
    )
  }

  const workbookBuffer = await response.arrayBuffer()
  const fileName = DEFAULT_WORKBOOK_URL.split('/').pop() ?? 'promociones_crediflex.xlsx'
  return parseWorkbookBuffer(fileName, workbookBuffer)
}
