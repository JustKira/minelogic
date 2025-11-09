import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commands } from '@/core/api/tauri_bindings'
import { tauriQuery } from '@/core/api/helpers'

enum SFTPQueryKeys {
  ACTIVE_CONNECTION = 'active_connection',
}

export const useGetActiveConnectionQuery = () => {
  return useQuery({
    queryKey: [SFTPQueryKeys.ACTIVE_CONNECTION],
    queryFn: () => tauriQuery(() => commands.getActiveConnection()),
  })
}

export const useConnectToRemoteProjectMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      return tauriQuery(() => commands.connectToRemoteProject(id))
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [SFTPQueryKeys.ACTIVE_CONNECTION],
      })
    },
    onError(error) {
      console.error(error)
    },
  })
}
