import React, { useState, useEffect } from 'react'
import { fapi, makeServerRequest } from '../../utils'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { v4 as uuidv4 } from 'uuid'

import './orderbook.css'

const OrderBook = () => {
  const [ orderBook, setOrderBook ] = useState({bids: [], asks: []})

  useEffect(
    () => {
      const getDepthSnapshot = async () => {
        const data = await makeServerRequest({ symbol: 'BTCUSDT', limit: '1000' }, 'getDepthSnapshot')

        const bids = data.bids
        const asks = data.asks

        console.log(bids, asks)

        setOrderBook(prevOrderBook => {
          return ({
            bids,
            asks
          })
        })
      }
      getDepthSnapshot()
      setInterval(() => {
        getDepthSnapshot()
      }, 1000 * 10);
    },
    []
  )

  // useEffect(
  //   () => {
  //     const depthSocket = new ReconnectingWebSocket(`${fapi.wss}btcusdt@depth@500ms`)

  //     depthSocket.onopen = () => console.log(`Connection to depth socket has been established...`)

  //     depthSocket.onmessage = (event) => {
  //       const message = JSON.parse(event.data)
  //       const { b, a } = message
  //       const newBidPrices = b.map(bid => bid[0])
  //       const newAskPrices = a.map(ask => ask[0])
  //       console.log(typeof message)

  //       setOrderBook(prevOrderBook => {
  //         const updatedBids = prevOrderBook.bids.filter(bid => !newBidPrices.includes(bid[0])).sort((a, b) => Number(a[0]) < Number(b[0]))
  //         const updatedAsks = prevOrderBook.asks.filter(ask => !newAskPrices.includes(ask[0])).sort((a, b) => Number(a[0]) > Number(b[0]))
  //         return ({
  //           bids: [...updatedBids, ...message.b.sort((a, b) => Number(a[0]) < Number(b[0]))],
  //           asks: [...updatedAsks, ...message.a.sort((a, b) => Number(a[0]) > Number(b[0]))]
  //         })
  //       })
  //     }

  //     depthSocket.onclose = (error) => console.log(`Connection to depth socket has been closed. Reason: ${error}`)

  //   },
  //   []
  // )

  const asks = orderBook.asks.map(ask => (<li key={uuidv4()} className='order-book__list-item'><p>{ask[0]}</p><p>{ask[1]}</p></li>))
  const bids = orderBook.bids.map(bid => (<li key={uuidv4()} className='order-book__list-item'><p>{bid[0]}</p><p>{bid[1]}</p></li>))

  return (
    <div className='order-book__wrapper'>
      <div>
        <h2>Bids</h2>
        <ul className='order-book__list'>
          {...bids}
        </ul>
      </div>
      <div>
        <h2>Asks</h2>
        <ul className='order-book__list'>
          {...asks}
        </ul>
      </div>
    </div>
  )
}

export default OrderBook