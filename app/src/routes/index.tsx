import {
  useProjectsQuery,
  useRemoveRemoteProjectMutation,
} from '@/lib/project/api'

import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { FolderCodeIcon, TrashIcon } from 'lucide-react'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/lib/core/elements/empty'
import { Button } from '@/lib/core/elements/button'

import { AddRemoteProjectForm } from '@/lib/project/forms/add-remote-project'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/lib/core/elements/dialog'

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/lib/core/elements/item'
import { RemoteProject } from '@/core/api/tauri_bindings'
import {
  useConnectToRemoteProjectMutation,
  useGetActiveConnectionQuery,
} from '@/lib/ssh/api'
import { toast } from 'sonner'
import { ModeToggle } from '@/lib/core/components/mode-toggle'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const projectsQuery = useProjectsQuery()

  const [isEmpty, setIsEmpty] = useState(false)

  useEffect(() => {
    const isEmpty =
      Object.keys(projectsQuery.data?.local_projects ?? {}).length === 0 &&
      Object.keys(projectsQuery.data?.remote_projects ?? {}).length === 0

    setIsEmpty(isEmpty)
  }, [projectsQuery.data])

  return (
    <main className="flex h-dvh flex-col items-center justify-center">
      {isEmpty ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderCodeIcon />
            </EmptyMedia>
            <EmptyTitle>No projects</EmptyTitle>
            <EmptyDescription>Add a project to get started</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <AddRemoteProjectModal />
              <Button variant="outline" disabled>
                Add Local Project
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex w-full max-w-xl flex-col gap-2">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-medium">Projects</h1>
            <div className="flex gap-2">
              <AddRemoteProjectModal />
              <Button variant="outline" disabled>
                Add Local Project
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(projectsQuery.data?.remote_projects ?? {}).map(
              ([key, value]) => {
                if (!value) return null
                return <RemoteProjectItem id={key} project={value} />
              },
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4">
        <ModeToggle />
      </div>
    </main>
  )
}

const RemoteProjectItem = ({
  id,
  project,
}: {
  id: string
  project: RemoteProject
}) => {
  const navigate = Route.useNavigate()
  const removeProjectMutation = useRemoveRemoteProjectMutation()
  const connectToRemoteProjectMutation = useConnectToRemoteProjectMutation()

  const activeConnectionQuery = useGetActiveConnectionQuery()

  const handleRemoveProject = () => {
    removeProjectMutation.mutate(id)
  }

  const handleConnectToRemoteProject = () => {
    if (activeConnectionQuery.data && activeConnectionQuery.data.id === id) {
      return navigate({
        to: '/projects/project_id',
        params: { project_id: id },
      })
    }

    toast.promise(connectToRemoteProjectMutation.mutateAsync(id), {
      loading: 'Connecting to remote project...',
      success: () => {
        navigate({
          to: '/projects/project_id',
          params: { project_id: id },
        })
        return 'Connected to remote project'
      },
      error: (error) => {
        if (error instanceof Error) {
          return error.message
        }
        if (typeof error === 'string') {
          return error
        }
        return 'Failed to connect to remote project'
      },
    })
  }

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>{project.host}</ItemTitle>
        <ItemDescription>
          {project.user}@{project.host}:{project.port}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="outline"
          size="lg"
          disabled={connectToRemoteProjectMutation.isPending}
          onClick={handleConnectToRemoteProject}
        >
          {activeConnectionQuery.data && activeConnectionQuery.data.id === id
            ? 'Open Project'
            : 'Connect'}
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="icon-lg">
              <TrashIcon />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Project</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to remove this project?
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleRemoveProject}
              >
                Remove
              </Button>
              <DialogClose asChild>
                <Button variant="outline" size="lg">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ItemActions>
    </Item>
  )
}

const AddRemoteProjectModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Remote Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Remote Project</DialogTitle>
        </DialogHeader>
        <AddRemoteProjectForm
          onSuccess={() => {
            setIsOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
