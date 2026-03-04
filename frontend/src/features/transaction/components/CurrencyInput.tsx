import { forwardRef, type ChangeEvent } from 'react'
import { Input } from '@/shared/components/ui/input'
import { formatCurrencyInput } from '@/shared/utils/currency'

interface CurrencyInputProps {
  value: string
  onChange: (digits: string) => void
  id?: string
  name?: string
  className?: string
  hasError?: boolean
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, id, name, className, hasError }, ref) => {
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value.replace(/\D/g, '')
      onChange(raw)
    }

    return (
      <Input
        ref={ref}
        id={id}
        name={name}
        inputMode="decimal"
        value={formatCurrencyInput(value)}
        onChange={handleChange}
        className={`${className ?? ''} ${hasError ? 'border-red-400' : ''}`}
      />
    )
  },
)

CurrencyInput.displayName = 'CurrencyInput'
