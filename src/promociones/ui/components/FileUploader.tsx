import type { ChangeEvent } from 'react'
import styled from 'styled-components'
import { layout } from '../../../shared/styles/theme'

interface FileUploaderProps {
  fileName: string
  loadedAtIso: string
  isLoading: boolean
  onFileSelected: (file: File) => Promise<void>
}

// Formats load date to a concise local representation for the header.
const formatLoadedAt = (loadedAtIso: string): string => {
  if (!loadedAtIso) {
    return '-'
  }

  const parsedDate = new Date(loadedAtIso)
  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// File uploader with metadata summary of the current active workbook.
export const FileUploader = ({
  fileName,
  loadedAtIso,
  isLoading,
  onFileSelected,
}: FileUploaderProps) => {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      return
    }

    await onFileSelected(selectedFile)

    // Clears the input so the same file can be selected again if needed.
    event.target.value = ''
  }

  return (
    <Container>
      <Metadata>
        <Label>Archivo activo</Label>
        <Value>{fileName}</Value>
      </Metadata>

      <Metadata>
        <Label>Ultima carga</Label>
        <Value>{formatLoadedAt(loadedAtIso)}</Value>
      </Metadata>

      <Actions>
        <UploadLabel htmlFor="promotions-workbook-upload">
          {isLoading ? 'Procesando archivo...' : 'Cargar archivo (.xlsx)'}
        </UploadLabel>
        <HiddenInput
          id="promotions-workbook-upload"
          type="file"
          accept=".xlsx,.xls"
          disabled={isLoading}
          onChange={handleFileChange}
        />
      </Actions>
    </Container>
  )
}

const Container = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 1rem;
  background: var(--card);

  @media (max-width: ${layout.tablet}) {
    grid-template-columns: 1fr;
  }
`

const Metadata = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  min-width: 0;
`

const Label = styled.span`
  font-size: 0.78rem;
  color: var(--ink-secondary);
`

const Value = styled.span`
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--ink-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: ${layout.tablet}) {
    justify-content: flex-start;
  }
`

const UploadLabel = styled.label`
  cursor: pointer;
  border: 1px solid #0e5c83;
  border-radius: 0.8rem;
  padding: 0.7rem 1rem;
  color: #0e5c83;
  font-weight: 600;
  background: #f2f8fd;
  transition: background-color 120ms ease-in-out;

  &:hover {
    background: #e4f2fb;
  }
`

const HiddenInput = styled.input`
  display: none;
`
