import React, { useEffect, useState } from 'react'
import { formatTime, makeServerRequest } from '../../utils'
import { v4 as uuidv4 } from 'uuid'

import './latesttrades.css'

const LatestTrades = () => {
  const [ recentTrades, setRecentTrades ] = useState([])

  useEffect(
    () => {
      const getRecentTrades = async () => {
        const data = await makeServerRequest({ symbol: 'BTCUSDT', limit: '100' }, 'getRecentTrades')
        const formattedData = data.reverse().map((trade, index) => {
          return ({
            time: formatTime(trade.time),
            price: trade.price,
            amount: trade.quoteQty
          })
        })
        console.log(formattedData.map(trade => trade.time))
        setRecentTrades(prevTrades => {
          return ([
            ...prevTrades,
            ...formattedData
          ])
        })
      }
      getRecentTrades()
    },
    []
  )

  const trades = recentTrades.map(trade => (
    <div className='trade-list__item' key={uuidv4()}>
      <p>{ trade.time }</p>
      <p>{ trade.price }</p>
      <p>{ trade.amount }</p>
    </div>
  ))

  return (
    <div className='trade-list__container'>
      {trades}
    </div>
  )
}

export default LatestTrades