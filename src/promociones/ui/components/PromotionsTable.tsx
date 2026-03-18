import styled from 'styled-components'
import type { PromotionRecord } from '../../model/types'

interface PromotionsTableProps {
  headers: string[]
  records: PromotionRecord[]
}

// Table renderer for dynamic promotion fields.
export const PromotionsTable = ({ headers, records }: PromotionsTableProps) => {
  if (!records.length) {
    return (
      <EmptyState>
        No hay resultados para los filtros aplicados en este momento.
      </EmptyState>
    )
  }

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            {headers.map((header) => (
              <HeaderCell key={header}>{header}</HeaderCell>
            ))}
          </tr>
        </thead>

        <tbody>
          {records.map((record, index) => (
            <tr key={`${record[headers[0]] ?? 'row'}-${index}`}>
              {headers.map((header) => (
                <BodyCell key={`${index}-${header}`}>
                  {record[header] || '-'}
                </BodyCell>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  )
}

const TableWrapper = styled.div`
  border: 1px solid var(--line);
  border-radius: 1rem;
  overflow: hidden;
  background: var(--card);
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
`

const HeaderCell = styled.th`
  position: sticky;
  top: 0;
  background: #f3f8ff;
  color: #19314e;
  padding: 0.72rem 0.62rem;
  text-align: left;
  border-bottom: 1px solid var(--line);
  font-size: 0.74rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`

const BodyCell = styled.td`
  padding: 0.64rem 0.62rem;
  font-size: 0.82rem;
  color: var(--ink-primary);
  border-bottom: 1px solid #eef2f9;
  vertical-align: top;
  line-height: 1.4;
  max-width: 380px;
  word-break: break-word;
`

const EmptyState = styled.section`
  border: 1px dashed #bdd0e8;
  border-radius: 1rem;
  background: #f7fbff;
  color: #375275;
  padding: 1rem;
  text-align: center;
  font-size: 0.92rem;
`
