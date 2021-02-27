/// <reference types="resize-observer-browser" />
import React, { ReactNode, useEffect, useMemo, useRef } from 'react'

export const Measure = ({
  children,
  onResize
}: {
  children: ReactNode
  onResize: () => void
}) => {
  const observer = useMemo(() => new ResizeObserver(() => onResize()), [
    onResize
  ])
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const current = ref.current
    if (!current) return

    observer.observe(current)
    return () => {
      observer.unobserve(current)
    }
  }, [ref, observer])

  return <div ref={ref}>{children}</div>
}
