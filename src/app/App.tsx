import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppRoutes } from '@/routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <AppRoutes />
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e8d5c4',
              color: '#2c1810',
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
