import { render, screen } from '@testing-library/react'
import { CategoryBreakdown } from './CategoryBreakdown'

const items = [
  { categoryId: 'c1', categoryName: 'Alimentação', categoryColor: '#f97316', total: '800.00' },
  { categoryId: 'c2', categoryName: 'Transporte', categoryColor: '#3b82f6', total: '200.00' },
]

describe('CategoryBreakdown', () => {
  it('should show skeleton when loading', () => {
    const { container } = render(<CategoryBreakdown items={[]} isLoading />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('should return null when items are empty', () => {
    const { container } = render(<CategoryBreakdown items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should show category names and amounts', () => {
    render(<CategoryBreakdown items={items} />)
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Transporte')).toBeInTheDocument()
    expect(screen.getByText('R$ 800,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 200,00')).toBeInTheDocument()
  })

  it('should show percentages', () => {
    render(<CategoryBreakdown items={items} />)
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
  })

  it('should show section heading', () => {
    render(<CategoryBreakdown items={items} />)
    expect(screen.getByText('Por categoria')).toBeInTheDocument()
  })
})
