import { Result } from './tauri_bindings'

export async function tauriQuery<T, E>(command: () => Promise<Result<T, E>>) {
  const result = await command()
  if (result.status === 'ok') {
    return result.data
  } else {
    if (result.error instanceof Error) {
      throw result.error
    } else if (typeof result.error === 'string') {
      throw new Error(result.error)
    } else {
      throw new Error('Unknown error')
    }
  }
}
