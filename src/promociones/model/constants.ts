// Browser storage key for keeping the latest uploaded dataset.
export const LAST_DATASET_STORAGE_KEY = 'crediflex.promociones.lastDataset'

// Bundled workbook used as initial source when there is no saved data.
export const DEFAULT_WORKBOOK_URL =
  '/data/promociones_crediflex_20260318_144531.xlsx'

// Canonical headers appended from configuration sheet mappings.
export const CODPROM_NAME_COLUMN = 'codprom_nombre'
export const CODPROM_DESCRIPTION_COLUMN = 'codprom_descripcion'

// Header candidates used to identify codprom key columns.
export const CODPROM_HEADER_CANDIDATES = ['codprom', 'cod_prom', 'codigo_prom']

// Header candidates used to find codprom metadata columns.
export const CODPROM_NAME_CANDIDATES = ['nombre', 'name']
export const CODPROM_DESCRIPTION_CANDIDATES = ['descripcion', 'description']

// Header candidates used to detect validity date range fields.
export const DATE_FROM_HEADER_CANDIDATES = [
  'dt_desde',
  'fecha_desde',
  'desde',
  'inicio',
  'start_date',
]

export const DATE_TO_HEADER_CANDIDATES = [
  'dt_hasta',
  'fecha_hasta',
  'hasta',
  'fin',
  'end_date',
]
