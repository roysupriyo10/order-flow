import { useState } from 'react'
import './App.css'
import Chart from './components/chart/Chart'
import OrderBook from './components/order-book/OrderBook'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Chart />
      <OrderBook />
    </>
  )
}

export default App
