"use client"

import { useState } from "react"

export function TestComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  return (
    <div className="border p-4 rounded-md mt-4">
      <h2 className="text-xl font-semibold">Test Component</h2>

      <button className="mt-2 px-4 py-2 bg-gray-200 rounded-md" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Hide" : "Show"} Form
      </button>

      {isOpen && (
        <div className="mt-4 p-4 border rounded-md">
          <label className="block mb-2">
            <span className="text-gray-700">Input:</span>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter some text"
            />
          </label>

          <div className="mt-2">
            <p>
              You typed: <strong>{inputValue || "Nothing yet"}</strong>
            </p>
          </div>

          <div className="mt-4 flex space-x-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={() => alert(`Submitted: ${inputValue}`)}
            >
              Submit
            </button>
            <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setInputValue("")}>
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
