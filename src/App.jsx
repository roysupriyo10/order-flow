import { useState } from 'react'
import './App.css'
import Chart from './components/chart/Chart'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Chart />
    </>
  )
}

export default App
