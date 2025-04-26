"use client"

import { useState } from "react"

interface SimpleComponentProps {
  title: string
}

export function SimpleComponent({ title }: SimpleComponentProps) {
  const [count, setCount] = useState(0)

  return (
    <div className="border p-4 rounded-md">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p>Count: {count}</p>
      <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
