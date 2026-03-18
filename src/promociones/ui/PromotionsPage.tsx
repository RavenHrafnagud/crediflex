import { useDeferredValue } from 'react'
import styled from 'styled-components'
import { usePromotionFilters } from '../hooks/usePromotionFilters'
import { usePromotionsWorkbook } from '../hooks/usePromotionsWorkbook'
import { FileUploader } from './components/FileUploader'
import { FiltersPanel } from './components/FiltersPanel'
import { PromotionsTable } from './components/PromotionsTable'
import { getTodayIso } from '../../shared/utils/date'
import { layout } from '../../shared/styles/theme'

// Main domain page orchestrating load, filter and visualization flows.
export const PromotionsPage = () => {
  const {
    dataset,
    status,
    errorMessage,
    loadWorkbookFromFile,
    reloadDefaultWorkbook,
  } = usePromotionsWorkbook()

  const {
    filters,
    showOnlyToday,
    filteredRecords,
    totalRecords,
    setFilterValue,
    setShowOnlyToday,
    resetFilters,
  } = usePromotionFilters(dataset)

  const deferredRecords = useDeferredValue(filteredRecords)
  const todayIso = getTodayIso()

  return (
    <Page>
      <Shell>
        <Hero>
          <Title>Panel de Promociones CrediFlex</Title>
          <Subtitle>
            Vista del dia actual: <strong>{todayIso}</strong>
          </Subtitle>
        </Hero>

        {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}

        <FileUploader
          fileName={dataset?.fileName ?? '-'}
          loadedAtIso={dataset?.loadedAtIso ?? ''}
          isLoading={status === 'loading'}
          onFileSelected={loadWorkbookFromFile}
        />

        <Toolbar>
          <ToolbarInfo>
            <MetricCard>
              <MetricLabel>Registros visibles</MetricLabel>
              <MetricValue>{deferredRecords.length}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Total cargados</MetricLabel>
              <MetricValue>{totalRecords}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Estado</MetricLabel>
              <MetricValue>{status}</MetricValue>
            </MetricCard>
          </ToolbarInfo>

          <ResetDefaultButton type="button" onClick={() => void reloadDefaultWorkbook()}>
            Restaurar archivo base
          </ResetDefaultButton>
        </Toolbar>

        {dataset ? (
          <>
            <FiltersPanel
              headers={dataset.headers}
              filters={filters}
              showOnlyToday={showOnlyToday}
              dateRangeColumns={dataset.dateRangeColumns}
              onFilterChange={setFilterValue}
              onShowOnlyTodayChange={setShowOnlyToday}
              onResetFilters={resetFilters}
            />

            <TableScroll>
              <PromotionsTable headers={dataset.headers} records={deferredRecords} />
            </TableScroll>
          </>
        ) : (
          <EmptyLayout>
            Cargando informacion inicial del archivo de promociones...
          </EmptyLayout>
        )}
      </Shell>
    </Page>
  )
}

const Page = styled.main`
  padding: 1rem;

  @media (max-width: ${layout.mobile}) {
    padding: 0.75rem;
  }
`

const Shell = styled.section`
  max-width: ${layout.contentMaxWidth};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Hero = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  border-radius: 1rem;
  padding: 1rem 1.1rem;
  background: linear-gradient(120deg, #0a5f7d 0%, #0d8275 100%);
  color: #f8fdff;

  @media (max-width: ${layout.mobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.2;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.88rem;
  color: #d9f2f5;
`

const ErrorBox = styled.section`
  border: 1px solid var(--warn-border);
  background: var(--warn-bg);
  color: #6f4f00;
  border-radius: 0.8rem;
  padding: 0.7rem 0.9rem;
  font-size: 0.88rem;
`

const Toolbar = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: ${layout.tablet}) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const ToolbarInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  width: 100%;

  @media (max-width: ${layout.mobile}) {
    grid-template-columns: 1fr;
  }
`

const MetricCard = styled.article`
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 0.9rem;
  padding: 0.72rem 0.82rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`

const MetricLabel = styled.span`
  font-size: 0.74rem;
  color: var(--ink-secondary);
`

const MetricValue = styled.span`
  font-size: 1rem;
  font-weight: 700;
`

const ResetDefaultButton = styled.button`
  border: 1px solid #9eb8cc;
  color: #23405f;
  background: #f4f8fc;
  border-radius: 0.7rem;
  padding: 0.58rem 0.9rem;
  cursor: pointer;
  font-weight: 600;
`

const TableScroll = styled.div`
  overflow-x: auto;
`

const EmptyLayout = styled.section`
  border: 1px dashed #b4c8df;
  background: #f8fbff;
  color: #43668f;
  border-radius: 0.9rem;
  padding: 1rem;
  text-align: center;
`
