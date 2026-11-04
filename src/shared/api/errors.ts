export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') {
    if (error === 'Network Error' || error.includes('NetworkError')) return fallback
    return error
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>

    if (typeof err.error === 'string') {
      if (err.error === 'Network Error' || err.error.includes('NetworkError')) return fallback
      return err.error
    }

    if (typeof err.data === 'object' && err.data !== null) {
      const data = err.data as Record<string, unknown>
      if (typeof data.error === 'string') return data.error
    }

    if (typeof err.message === 'string') {
      if (err.message === 'Network Error' || err.message.includes('NetworkError')) return fallback
      return err.message
    }
  }

  return fallback
}