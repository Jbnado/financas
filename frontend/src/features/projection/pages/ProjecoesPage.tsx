import { useState } from 'react'
import { ProjectionChart } from '../components/ProjectionChart'
import { ProjectionSummaryCard } from '../components/ProjectionSummaryCard'
import { DeficitAlerts } from '../components/DeficitAlerts'
import { CommitmentTable } from '../components/CommitmentTable'
import { useProjection, useInstallmentCommitments } from '../hooks/use-projection'

const horizonOptions = [
  { value: 3, label: '3 meses' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '12 meses' },
]

export default function ProjecoesPage() {
  const [months, setMonths] = useState(6)
  const { data: projection, isLoading: projLoading } = useProjection(months)
  const { data: commitments, isLoading: commLoading } = useInstallmentCommitments()

  const projections = projection?.projections ?? []
  const alerts = projection?.alerts ?? []
  const commitmentList = commitments?.commitments ?? []

  const isEmpty = !projLoading && (projections.length === 0 || projections.every((p) => p.projectedSalary === '0.00'))

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Projeção Financeira</h1>
        {!isEmpty && (
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
            aria-label="Horizonte"
          >
            {horizonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Sem dados para projeção</p>
          <p className="text-sm text-muted-foreground">Crie ciclos e adicione transações para ver projeções</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl p-4" style={{ backgroundColor: '#1e293b' }}>
            <ProjectionSummaryCard
              projections={projections}
              isLoading={projLoading}
            />
          </div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: '#1e293b' }}>
            <ProjectionChart
              projections={projections}
              isLoading={projLoading}
            />
          </div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: '#1e293b' }}>
            <DeficitAlerts
              alerts={alerts}
              isLoading={projLoading}
            />
          </div>

          <div className="rounded-2xl p-4" style={{ backgroundColor: '#1e293b' }}>
            <CommitmentTable
              commitments={commitmentList}
              isLoading={commLoading}
            />
          </div>
        </div>
      )}
    </div>
  )
}
