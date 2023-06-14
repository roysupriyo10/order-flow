import React, { useEffect, useState } from 'react'
import { cutNumber, determineGreenRed, fapi, formatTime, makeApiRequest, makeServerRequest } from '../../utils'
import { v4 as uuidv4 } from 'uuid'

import './latesttrades.css'
import ReconnectingWebSocket from 'reconnecting-websocket'

const LatestTrades = () => {
  const [ recentTrades, setRecentTrades ] = useState([])

  useEffect(
    () => {
      const getRecentTrades = async () => {
        const data = await makeApiRequest({ symbol: 'BTCUSDT', limit: '100' }, 'trades')

        console.log(data)
        const formattedData = data.reverse().map((trade, index) => {
          return ({
            time: formatTime(trade.time),
            price: trade.price,
            amount: trade.quoteQty,
            color: index !== 0 ? determineGreenRed(Number(trade.price) > Number(data[index - 1].price)) : '#089981'
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

  useEffect(
    () => {
      const latestTradesSocket = new ReconnectingWebSocket(`${fapi.wss}btcusdt@aggTrade`)

      latestTradesSocket.onopen = () => console.log(`Connection with trades websocket is open...`)
      latestTradesSocket.onclose = () => console.log(`Connection with trades websocket is close...`)

      latestTradesSocket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        setRecentTrades(prevTrades => {
          if (prevTrades.length > 149) {
            prevTrades.splice(149, prevTrades.length)
          }
          console.log(Number(message.p) + ' ' + Number(prevTrades.at(-1).price) + ' ' + (Number(message.p) > Number(prevTrades.at(-1).price)))
          return ([
            {
              time: formatTime(message.T),
              price: message.p,
              amount: cutNumber(Number(message.p) * Number(message.q), 2),
              color: determineGreenRed(Number(message.p) > Number(prevTrades.at(-1).price))
            },
            ...prevTrades
          ])
        })
      }
      return () => latestTradesSocket.close()
    },
    []
  )

  const trades = recentTrades.map(trade => (
    <div className={`trade-list__item`} key={uuidv4()}>
      <p>{ trade.time }</p>
      <p style={{ color: `${trade.color}` }}>{ trade.price }</p>
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