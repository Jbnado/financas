import { Badge } from '@/shared/components/ui/badge'

interface InstallmentBadgeProps {
  installmentNumber: number
  totalInstallments: number
}

export function InstallmentBadge({ installmentNumber, totalInstallments }: InstallmentBadgeProps) {
  return (
    <Badge variant="secondary" className="text-xs font-normal">
      {installmentNumber}/{totalInstallments}
    </Badge>
  )
}
