import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
      <h1 className="text-4xl font-bold text-primary-700 mb-6">Vite + React + Tailwind</h1>
      
      <button
        onClick={() => setCount((count) => count + 1)}
        className="btn mb-4"
      >
        Count is {count}
      </button>

      <p className="text-gray-600">
        Edit <code>src/App.jsx</code> and save to test HMR.
      </p>
    </div>
  )
}

export default App
