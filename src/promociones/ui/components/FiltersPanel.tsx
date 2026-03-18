import styled from 'styled-components'
import type { DateRangeColumns, PromotionFilters } from '../../model/types'
import { layout } from '../../../shared/styles/theme'

interface FiltersPanelProps {
  headers: string[]
  filters: PromotionFilters
  showOnlyToday: boolean
  dateRangeColumns: DateRangeColumns
  onFilterChange: (header: string, value: string) => void
  onShowOnlyTodayChange: (enabled: boolean) => void
  onResetFilters: () => void
}

const DATE_HEADER_HINT = /(fecha|date|dt_|desde|hasta|inicio|fin)/i

// Dynamic filter panel with one input per data column.
export const FiltersPanel = ({
  headers,
  filters,
  showOnlyToday,
  dateRangeColumns,
  onFilterChange,
  onShowOnlyTodayChange,
  onResetFilters,
}: FiltersPanelProps) => {
  const todayFilterDescription =
    dateRangeColumns.from && dateRangeColumns.to
      ? `Usa ${dateRangeColumns.from} y ${dateRangeColumns.to}`
      : 'No se encontraron columnas de rango de fecha'

  return (
    <Container>
      <HeaderRow>
        <Title>Filtros</Title>

        <HeaderActions>
          <TodayToggle>
            <input
              type="checkbox"
              checked={showOnlyToday}
              onChange={(event) => onShowOnlyTodayChange(event.target.checked)}
            />
            <span>Solo promociones vigentes hoy</span>
          </TodayToggle>
          <ResetButton type="button" onClick={onResetFilters}>
            Limpiar filtros
          </ResetButton>
        </HeaderActions>
      </HeaderRow>

      <Hint>{todayFilterDescription}</Hint>

      <FieldsGrid>
        {headers.map((header) => {
          const isDateField = DATE_HEADER_HINT.test(header)
          const inputType = isDateField ? 'date' : 'text'

          return (
            <Field key={header}>
              <Label htmlFor={`filter-${header}`}>{header}</Label>
              <Input
                id={`filter-${header}`}
                type={inputType}
                value={filters[header] ?? ''}
                placeholder={isDateField ? '' : `Filtrar por ${header}`}
                onChange={(event) => onFilterChange(header, event.target.value)}
              />
            </Field>
          )
        })}
      </FieldsGrid>
    </Container>
  )
}

const Container = styled.section`
  border: 1px solid var(--line);
  background: var(--card);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: ${layout.tablet}) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: 1rem;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
`

const TodayToggle = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.86rem;
  color: var(--ink-secondary);
`

const ResetButton = styled.button`
  border: 1px solid var(--line);
  background: #f8fbff;
  color: var(--ink-primary);
  border-radius: 0.7rem;
  padding: 0.52rem 0.85rem;
  cursor: pointer;
`

const Hint = styled.span`
  font-size: 0.75rem;
  color: var(--ink-secondary);
`

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: ${layout.tablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${layout.mobile}) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`

const Label = styled.label`
  font-size: 0.74rem;
  color: var(--ink-secondary);
`

const Input = styled.input`
  border: 1px solid var(--line);
  border-radius: 0.65rem;
  padding: 0.56rem 0.62rem;
  background: #ffffff;
  color: var(--ink-primary);

  &:focus {
    outline: 2px solid #cde8ff;
    border-color: #7ab7e8;
  }
`
