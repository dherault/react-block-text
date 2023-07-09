import { useEffect, useRef } from 'react'

function usePrevious<T>(value: T, refresh = false) {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  }, [value, refresh])

  return ref.current
}

export default usePrevious
