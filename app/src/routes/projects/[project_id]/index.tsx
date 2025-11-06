import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/project_id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/project_id/"!</div>
}
