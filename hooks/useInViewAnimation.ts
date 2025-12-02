import { useEffect, useRef, useState } from 'react'

export function useInViewAnimation(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2, ...options }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return { ref, isVisible }
}
