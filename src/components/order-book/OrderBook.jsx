import React, { useState, useEffect } from 'react'
import { makeServerRequest } from '../../utils'

const OrderBook = () => {
  const [ orderBook, setOrderBook ] = useState({bids: [], asks: []})

  useEffect(
    () => {
      const getDepthSnapshot = async () => {
        const data = await makeServerRequest({ symbol: 'BTCUSDT', limit: '5' }, 'getDepthSnapshot')

        const bids = data.bids
        const asks = data.asks

        setOrderBook(prevOrderBook => {
          return ({
            ...prevOrderBook,
            bids: [...prevOrderBook.bids, ...bids],
            asks: [...prevOrderBook.asks, ...asks]
          })
        })
      }
      getDepthSnapshot()
    },
    []
  )

  useEffect(
    () => {
      const subscribeDepth = async () => {

      }
    }
  )

  return (
    <div>

    </div>
  )
}

export default OrderBook