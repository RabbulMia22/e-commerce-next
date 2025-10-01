"use client"

import { useEffect, useState } from 'react'
import useBasketStore from '@/store/store'

export function useHydratedStore() {
  const [hydrated, setHydrated] = useState(false)
  const store = useBasketStore()

  useEffect(() => {

    setHydrated(true)
  }, [])

  return {
    ...store,
    hydrated
  }
}