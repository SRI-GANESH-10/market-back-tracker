import { useEffect, useState } from 'react'
import { fetchFunds, type Fund } from '@/lib/mfapi'

export const useFunds = () => {
  const [funds, setFunds] = useState<Fund[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    fetchFunds()
      .then((list) => { if (!ignore) setFunds(list) })
      .catch((e: Error) => { if (!ignore) setError(e.message) })
    return () => { ignore = true }
  }, [])

  return { funds, error, loading: !funds.length && !error }
}
