import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SplitSection } from './SplitSection'

vi.mock('@/shared/components/PersonCombobox', () => ({
  PersonCombobox: ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <select data-testid="person-combobox" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder ?? 'Selecione...'}</option>
      <option value="p1">Joao</option>
      <option value="p2">Maria</option>
    </select>
  ),
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('SplitSection', () => {
  it('should show "Adicionar pessoa" button', () => {
    render(
      <Wrapper>
        <SplitSection splits={[]} onChange={vi.fn()} totalAmount="300.00" />
      </Wrapper>,
    )

    expect(screen.getByText('Adicionar pessoa')).toBeInTheDocument()
  })

  it('should show "Minha parte" with full amount when no splits', () => {
    render(
      <Wrapper>
        <SplitSection splits={[]} onChange={vi.fn()} totalAmount="300.00" />
      </Wrapper>,
    )

    expect(screen.getByText('R$ 300,00')).toBeInTheDocument()
  })

  it('should calculate "Minha parte" correctly with splits', () => {
    render(
      <Wrapper>
        <SplitSection
          splits={[{ personId: 'p1', amount: '100' }]}
          onChange={vi.fn()}
          totalAmount="300.00"
        />
      </Wrapper>,
    )

    expect(screen.getByText('R$ 200,00')).toBeInTheDocument()
  })

  it('should show error when splits exceed total', () => {
    render(
      <Wrapper>
        <SplitSection
          splits={[{ personId: 'p1', amount: '400' }]}
          onChange={vi.fn()}
          totalAmount="300.00"
        />
      </Wrapper>,
    )

    expect(screen.getByText('A soma dos splits excede o valor total')).toBeInTheDocument()
  })

  it('should call onChange when adding a person', () => {
    const onChange = vi.fn()
    render(
      <Wrapper>
        <SplitSection splits={[]} onChange={onChange} totalAmount="300.00" />
      </Wrapper>,
    )

    fireEvent.click(screen.getByText('Adicionar pessoa'))
    expect(onChange).toHaveBeenCalledWith([{ personId: '', amount: '' }])
  })
})
