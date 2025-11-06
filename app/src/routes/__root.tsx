import { ThemeProvider } from '@/lib/core/components/theme-provider'
import { createRootRoute, Outlet } from '@tanstack/react-router'

const RootLayout = () => (
  <>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Outlet />
    </ThemeProvider>
  </>
)

export const Route = createRootRoute({ component: RootLayout })
