import React, { useEffect, useState } from 'react'
import { cutNumber, determineGreenRed, fapi, formatTime, makeApiRequest, makeServerRequest } from '../../utils'
import { v4 as uuidv4 } from 'uuid'

import './latesttrades.css'
import ReconnectingWebSocket from 'reconnecting-websocket'

export const LatestTrades = ({ recentTrades, setRecentTrades }) => {

  useEffect(
    () => {
      const getRecentTrades = async () => {
        const data = await makeApiRequest({ symbol: 'BTCUSDT', limit: '100' }, 'trades')

        const formattedData = data.reverse().map((trade, index) => {
          return ({
            time: formatTime(trade.time),
            price: trade.price,
            amount: trade.quoteQty,
            color: index !== 0 ? Number(trade.price) > Number(data[index - 1].price) ? '#089981' : '#f23645' : '#089981'
          })
        })
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
    <div className={`trade-list__item`} key={uuidv4()}>
      <p>{ trade.time }</p>
      <p style={{color: `${trade.color}`}} >{ trade.price }</p>
      <p>{ trade.amount }</p>
    </div>
  ))

  return (
    <div className='trade-list__container'>
      {trades}
    </div>
  )
}
