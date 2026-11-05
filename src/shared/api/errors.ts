const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!isRecord(error) || !('data' in error)) return fallback

  const { data } = error
  if (typeof data === 'string') return data
  if (!isRecord(data) || !('error' in data)) return fallback

  return typeof data.error === 'string' ? data.error : fallback
}
