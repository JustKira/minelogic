import { ThemeProvider } from '@/lib/core/components/theme-provider'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Outlet />
    </ThemeProvider>
  </QueryClientProvider>
)

export const Route = createRootRoute({ component: RootLayout })
