import { startTransition, useEffect, useState } from 'react'
import type { PromotionsDataset } from '../model/types'
import { loadDefaultDataset } from '../services/datasetLoader'
import { parseWorkbookFile } from '../services/excelParser'
import { clearDataset, loadDataset, saveDataset } from '../services/storageService'

type WorkbookStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UsePromotionsWorkbookResult {
  dataset: PromotionsDataset | null
  status: WorkbookStatus
  errorMessage: string | null
  loadWorkbookFromFile: (file: File) => Promise<void>
  reloadDefaultWorkbook: () => Promise<void>
}

// Converts unknown failures into user-friendly messages.
const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Ocurrio un error inesperado procesando el archivo.'
}

// Handles dataset lifecycle: restore, default load, upload parse and persistence.
export const usePromotionsWorkbook = (): UsePromotionsWorkbookResult => {
  const [dataset, setDataset] = useState<PromotionsDataset | null>(null)
  const [status, setStatus] = useState<WorkbookStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadDefaultSource = async () => {
    setStatus('loading')
    setErrorMessage(null)

    try {
      const defaultDataset = await loadDefaultDataset()
      saveDataset(defaultDataset)

      startTransition(() => {
        setDataset(defaultDataset)
        setStatus('ready')
      })
    } catch (error) {
      setDataset(null)
      setStatus('error')
      setErrorMessage(toErrorMessage(error))
    }
  }

  useEffect(() => {
    const persistedDataset = loadDataset()

    if (persistedDataset) {
      startTransition(() => {
        setDataset(persistedDataset)
        setStatus('ready')
      })
      return
    }

    void loadDefaultSource()
  }, [])

  const loadWorkbookFromFile = async (file: File) => {
    setStatus('loading')
    setErrorMessage(null)

    try {
      const parsedDataset = await parseWorkbookFile(file)
      saveDataset(parsedDataset)

      startTransition(() => {
        setDataset(parsedDataset)
        setStatus('ready')
      })
    } catch (error) {
      setStatus('error')
      setErrorMessage(toErrorMessage(error))
    }
  }

  const reloadDefaultWorkbook = async () => {
    clearDataset()
    await loadDefaultSource()
  }

  return {
    dataset,
    status,
    errorMessage,
    loadWorkbookFromFile,
    reloadDefaultWorkbook,
  }
}
