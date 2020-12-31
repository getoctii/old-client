import React, { ReactNode, useEffect } from 'react'
import { useMeasure } from 'react-use'

export const Measure = ({
  children,
  onResize
}: {
  children: ReactNode
  onResize: () => void
}) => {
  const [ref, size] = useMeasure<HTMLDivElement>()
  useEffect(() => {
    onResize()
  }, [size, onResize])
  return <div ref={ref}>{children}</div>
}
// wait I think I have hax
