import { useState } from 'react'
import { usePatrimony } from '../hooks/use-patrimony'
import { PatrimonyHeroCard } from '../components/PatrimonyHeroCard'
import { BankAccountList } from '../components/BankAccountList'
import { InvestmentList } from '../components/InvestmentList'
import { PatrimonyDistributionChart } from '../components/PatrimonyDistributionChart'
import { PatrimonyEvolutionChart } from '../components/PatrimonyEvolutionChart'

type Tab = 'contas' | 'investimentos' | 'graficos'

const TABS: { id: Tab; label: string }[] = [
  { id: 'contas', label: 'Contas' },
  { id: 'investimentos', label: 'Investimentos' },
  { id: 'graficos', label: 'Gráficos' },
]

export default function PatrimonioPage() {
  const [activeTab, setActiveTab] = useState<Tab>('contas')
  const { summary, distribution, evolution, isSummaryLoading, isDistributionLoading, isEvolutionLoading } = usePatrimony()

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Patrimônio</h1>

      <PatrimonyHeroCard summary={summary} isLoading={isSummaryLoading} />

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'contas' && <BankAccountList />}
      {activeTab === 'investimentos' && <InvestmentList />}
      {activeTab === 'graficos' && (
        <div className="space-y-4">
          <PatrimonyDistributionChart distribution={distribution} isLoading={isDistributionLoading} />
          <PatrimonyEvolutionChart evolution={evolution} isLoading={isEvolutionLoading} />
        </div>
      )}
    </div>
  )
}
