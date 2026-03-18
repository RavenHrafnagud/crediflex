// Represents one row from the promotions sheet as key/value strings.
export type PromotionRecord = Record<string, string>

// Represents one codprom definition row from the configuration sheet.
export interface CodpromMeaning {
  code: string
  name: string
  description: string
  raw: Record<string, string>
}

// Stores optional date column names used to apply "active today" filtering.
export interface DateRangeColumns {
  from?: string
  to?: string
}

// Full dataset consumed by the promotions screen.
export interface PromotionsDataset {
  dataSheetName: string
  configSheetName: string
  headers: string[]
  records: PromotionRecord[]
  codpromMeanings: Record<string, CodpromMeaning>
  dateRangeColumns: DateRangeColumns
  fileName: string
  loadedAtIso: string
}

// Dynamic filter state keyed by table headers.
export type PromotionFilters = Record<string, string>
