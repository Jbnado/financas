import { Plus } from 'lucide-react'

interface FabProps {
  onClick?: () => void
}

export function Fab({ onClick }: FabProps) {
  return (
    <button
      type="button"
      aria-label="Nova transacao"
      onClick={onClick}
      className="fixed bottom-18 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 md:bottom-6"
    >
      <Plus className="h-6 w-6" />
    </button>
  )
}
