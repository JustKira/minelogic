import { Button } from '@/lib/core/elements/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Link to="/projects/project_id" params={{ project_id: '1' }}>
        <Button variant="outline">Test</Button>
      </Link>
    </div>
  )
}
