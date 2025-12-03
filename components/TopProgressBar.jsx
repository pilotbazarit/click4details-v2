'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Progress } from '@/components/ui/progress'

export default function TopProgressBar() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Reset on route change
    setProgress(0)
    setVisible(true)

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setVisible(false), 300) // hide after done
          return 100
        }
        return prev + 20 // speed of loading
      })
    }, 200)

    return () => clearInterval(timer)
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <Progress value={progress} className="h-1 bg-transparent">
        {/* optional styling if needed */}
      </Progress>
    </div>
  )
}
