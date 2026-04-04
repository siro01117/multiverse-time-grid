import { useEffect } from 'react'

export default function Toast({ message, onHide }) {
  useEffect(() => {
    const timer = setTimeout(onHide, 1500)
    return () => clearTimeout(timer)
  }, [onHide])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
      <div className="bg-gray-800 text-white rounded-full px-4 py-2 text-sm whitespace-nowrap">
        {message}
      </div>
    </div>
  )
}
