import { LAST_DATASET_STORAGE_KEY } from '../model/constants'
import type { PromotionsDataset } from '../model/types'

interface StoredDatasetEnvelope {
  version: 1
  dataset: PromotionsDataset
}

// Saves the latest parsed dataset so it can be restored on next page load.
export const saveDataset = (dataset: PromotionsDataset): void => {
  if (typeof window === 'undefined') {
    return
  }

  const payload: StoredDatasetEnvelope = {
    version: 1,
    dataset,
  }

  window.localStorage.setItem(LAST_DATASET_STORAGE_KEY, JSON.stringify(payload))
}

// Restores the latest parsed dataset from localStorage when available.
export const loadDataset = (): PromotionsDataset | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(LAST_DATASET_STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredDatasetEnvelope
    if (!parsed || parsed.version !== 1 || !parsed.dataset) {
      return null
    }

    if (!Array.isArray(parsed.dataset.headers) || !Array.isArray(parsed.dataset.records)) {
      return null
    }

    return parsed.dataset
  } catch {
    return null
  }
}

// Clears persisted dataset to recover from invalid/corrupt stored entries.
export const clearDataset = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(LAST_DATASET_STORAGE_KEY)
}
