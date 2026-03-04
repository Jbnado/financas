import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { PersonCombobox } from '@/shared/components/PersonCombobox'
import { formatCurrency } from '@/shared/utils/currency'
import type { SplitInput } from '../types'

type SplitMode = 'split' | 'lend'

interface SplitSectionProps {
  splits: SplitInput[]
  onChange: (splits: SplitInput[]) => void
  totalAmount: string
  initialMode?: SplitMode
}

export function SplitSection({ splits, onChange, totalAmount, initialMode = 'split' }: SplitSectionProps) {
  const [mode, setMode] = useState<SplitMode>(initialMode)

  const total = parseFloat(totalAmount) || 0

  // In lend mode, auto-update the split amount when total changes
  useEffect(() => {
    if (mode === 'lend' && splits.length === 1 && splits[0].personId) {
      const current = parseFloat(splits[0].amount) || 0
      if (current !== total) {
        onChange([{ personId: splits[0].personId, amount: total.toFixed(2) }])
      }
    }
  }, [total, mode])

  function switchMode(newMode: SplitMode) {
    setMode(newMode)
    if (newMode === 'lend') {
      // Reset to single empty split
      onChange([{ personId: '', amount: total.toFixed(2) }])
    } else {
      onChange([])
    }
  }

  function handleLendPersonChange(personId: string) {
    onChange([{ personId, amount: total.toFixed(2) }])
  }

  // Split mode calculations
  const splitsTotal = splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)
  const userAmount = Math.max(0, total - splitsTotal).toFixed(2)
  const isOverflow = splitsTotal > total

  function addSplit() {
    onChange([...splits, { personId: '', amount: '' }])
  }

  function removeSplit(index: number) {
    onChange(splits.filter((_, i) => i !== index))
  }

  function updateSplit(index: number, field: keyof SplitInput, value: string) {
    const updated = splits.map((s, i) =>
      i === index ? { ...s, [field]: value } : s,
    )
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'split'
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent text-muted-foreground hover:bg-accent/50'
          }`}
          onClick={() => switchMode('split')}
        >
          Dividir valor
        </button>
        <button
          type="button"
          className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'lend'
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent text-muted-foreground hover:bg-accent/50'
          }`}
          onClick={() => switchMode('lend')}
        >
          Conta de outra pessoa
        </button>
      </div>

      {mode === 'lend' ? (
        <>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Responsável</label>
            <PersonCombobox
              value={splits[0]?.personId ?? ''}
              onChange={handleLendPersonChange}
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">Minha parte:</span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency('0.00')}
            </span>
          </div>
        </>
      ) : (
        <>
          {splits.map((split, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                {index === 0 && (
                  <label className="text-xs text-muted-foreground">Pessoa</label>
                )}
                <PersonCombobox
                  value={split.personId}
                  onChange={(id) => updateSplit(index, 'personId', id)}
                />
              </div>
              <div className="w-28 space-y-1">
                {index === 0 && (
                  <label className="text-xs text-muted-foreground">Valor</label>
                )}
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={split.amount}
                  onChange={(e) => updateSplit(index, 'amount', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSplit(index)}
                className="mb-1 p-1.5 rounded-lg hover:bg-accent/50 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addSplit} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar pessoa
          </Button>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">Minha parte:</span>
            <span
              className={`text-sm font-semibold ${isOverflow ? 'text-red-400' : 'text-foreground'}`}
            >
              {formatCurrency(userAmount)}
            </span>
          </div>
          {isOverflow && (
            <p className="text-xs text-red-400">
              A soma dos splits excede o valor total
            </p>
          )}
        </>
      )}
    </div>
  )
}
