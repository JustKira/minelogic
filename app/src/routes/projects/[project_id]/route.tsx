import { SidebarProvider } from '@/lib/core/elements/sidebar'
import { SidebarTrigger } from '@/lib/core/elements/sidebar'
import { ProjectSidebar } from '@/lib/project/components/project-sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/project_id')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <ProjectSidebar />
      <main>
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
