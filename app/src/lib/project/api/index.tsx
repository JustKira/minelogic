import { tauriQuery } from '@/core/api/helpers'
import { commands } from '@/core/api/tauri_bindings'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

enum ProjectQueryKeys {
  PROJECTS = 'projects',
}

export const useProjectsQuery = () => {
  return useQuery({
    queryKey: [ProjectQueryKeys.PROJECTS],
    queryFn: () => tauriQuery(commands.listAllProjects),
  })
}

export type AddLocalProjectInputs = Parameters<typeof commands.addLocalProject>

export const useAddLocalProjectMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inputs: AddLocalProjectInputs) => {
      return tauriQuery(() => commands.addLocalProject(...inputs))
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [ProjectQueryKeys.PROJECTS] })
    },
    onError(error) {
      console.error(error)
      toast.error(error.toString())
    },
  })
}

export type AddRemoteProjectInputs = Parameters<
  typeof commands.addRemoteProject
>

export const useAddRemoteProjectMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inputs: AddRemoteProjectInputs) => {
      return tauriQuery(() => commands.addRemoteProject(...inputs))
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [ProjectQueryKeys.PROJECTS] })
    },
    onError(error) {
      console.error(error)
      toast.error(error.toString())
    },
  })
}

export const useRemoveRemoteProjectMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      return tauriQuery(() => commands.removeRemoteProject(id))
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [ProjectQueryKeys.PROJECTS] })
    },
    onError(error) {
      console.error(error)
      toast.error(error.toString())
    },
  })
}
