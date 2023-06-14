import React, { useState, useEffect } from 'react'
import { fapi, makeApiRequest, makeServerRequest } from '../../utils'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { v4 as uuidv4 } from 'uuid'

import './orderbook.css'

const OrderBook = () => {
  const [ orderBook, setOrderBook ] = useState({bids: [], asks: []})

  useEffect(
    () => {
      const getDepthSnapshot = async () => {
        const data = await makeApiRequest({ symbol: 'BTCUSDT', limit: '10' }, 'depth')

        const bids = data.bids
        const asks = data.asks

        // console.log(bids, asks)

        setOrderBook(prevOrderBook => {
          return ({
            bids,
            asks
          })
        })
      }
      getDepthSnapshot()
      // setInterval(() => {
      //   getDepthSnapshot()
      // }, 1000 * 15);
    },
    []
  )

  useEffect(
    () => {
      const depthSocket = new ReconnectingWebSocket(`${fapi.wss}btcusdt@depth@500ms`)

      depthSocket.onopen = () => console.log(`Connection to depth socket has been established...`)
      depthSocket.onclose = (error) => console.log(`Connection to depth socket has been closed. Reason: ${error}`)

      depthSocket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        // console.log(message)

        const { b, a } = message
        // const newBidPrices = b.map(bid => bid[0])
        // const newAskPrices = a.map(ask => ask[0])
        // console.log(typeof message)
        
        // let a = [1, 2, 3], b = [101, 2, 1, 10]
        setOrderBook(prevOrderBook => {
          b.forEach(bid => {
            prevOrderBook.bids.forEach((oldBid, index) => {
              if (oldBid[0] === bid[0]) {
                prevOrderBook.bids[index] = bid
              }
            })
          })
          a.forEach(ask => {
            prevOrderBook.asks.forEach((oldAsk, index) => {
              if (oldAsk[0] === ask[0]) {
                prevOrderBook.asks[index] = ask
              }
            })
          })

          console.log(prevOrderBook.bids.sort((a, b) => Number(a[0]) < Number(b[0])))
          console.log(prevOrderBook.asks.sort((a, b) => Number(a[0]) > Number(b[0])))

          return ({
            bids: [ ...b, ...prevOrderBook.bids ],
            asks: [ ...a, ...prevOrderBook.asks ]
          })
        })

        // setOrderBook(prevOrderBook => {
        //   const updatedBids = prevOrderBook.bids.filter(bid => !newBidPrices.includes(bid[0])).sort((a, b) => Number(a[0]) < Number(b[0]))
        //   const updatedAsks = prevOrderBook.asks.filter(ask => !newAskPrices.includes(ask[0])).sort((a, b) => Number(a[0]) > Number(b[0]))
        //   return ({
        //     bids: [...updatedBids, ...message.b.sort((a, b) => Number(a[0]) < Number(b[0]))],
        //     asks: [...updatedAsks, ...message.a.sort((a, b) => Number(a[0]) > Number(b[0]))]
        //   })
        // })
      } 

      return () => depthSocket.close()
    },
    []
  )

  const asks = orderBook.asks.sort((a, b) => Number(a[0]) < Number(b[0])).map(ask => (<li key={uuidv4()} className='order-book__list-item'><p>{ask[0]}</p><p>{ask[1]}</p></li>))
  const bids = orderBook.bids.sort((a, b) => Number(a[0]) < Number(b[0])).map(bid => (<li key={uuidv4()} className='order-book__list-item'><p>{bid[0]}</p><p>{bid[1]}</p></li>))

  return (
    <div className='order-book__container'>
      <div className='bids'>
        <ul className='order-book__list'>
          {...bids}
        </ul>
      </div>
      <div className='asks'>
        <ul className='order-book__list'>
          {...asks}
        </ul>
      </div>
    </div>
  )
}

export default OrderBook