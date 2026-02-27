import { Toaster as SonnerToaster } from 'sonner'

function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: 'bg-card border-border text-foreground',
          description: 'text-muted-foreground',
        },
      }}
    />
  )
}

export { Toaster }
