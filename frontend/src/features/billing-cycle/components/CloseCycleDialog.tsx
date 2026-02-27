import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'

interface CloseCycleDialogProps {
  open: boolean
  cycleName: string
  onConfirm: () => void
  onCancel: () => void
  isClosing: boolean
}

export function CloseCycleDialog({
  open,
  cycleName,
  onConfirm,
  onCancel,
  isClosing,
}: CloseCycleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fechar ciclo {cycleName}?</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. O ciclo será marcado como fechado e
            não poderá mais ser editado.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} disabled={isClosing}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isClosing}>
            {isClosing ? 'Fechando...' : 'Fechar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
