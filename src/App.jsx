import { useState } from 'react'
import './App.css'
import Chart from './components/chart/Chart'
import OrderBook from './components/order-book/OrderBook'
import LatestTrades from './components/latest-trades/LatestTrades'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Chart />
      <OrderBook />
      <LatestTrades />
    </>
  )
}

export default App
