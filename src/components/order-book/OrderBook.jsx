import React, { useEffect } from 'react'
import { cutNumber, makeApiRequest, findRelativePercentage, convertToInternationalCurrencySystem } from '../../utils'
import { v4 as uuidv4 } from 'uuid'

import './orderbook.css'

export const OrderBook = ({ orderBook, setOrderBook, latestCandle }) => {

  useEffect(
    () => {
      const getDepthSnapshot = async () => {
        const { bids, asks } = await makeApiRequest({ symbol: 'BTCUSDT', limit: '20' }, 'depth')

        setOrderBook({ bids, asks })
      }
      getDepthSnapshot()
    },
    []
  )

  const asks = orderBook.asks.sort((a, b) => Number(a[0]) < Number(b[0])).map(
    ask => (
      <li key={uuidv4()} className='order-book__list-item'>
        <p>{ cutNumber(ask[0], 1) }</p>
        <p className={`${findRelativePercentage(ask[0], latestCandle.open) >= 0 ? 'green' : 'red'}`}>{ (findRelativePercentage(ask[0], latestCandle.open) >= 0 ? '+' : '') + cutNumber(findRelativePercentage(ask[0], latestCandle.open), 2) }</p>
        <p>{ convertToInternationalCurrencySystem(Number(ask[1]) * Number(ask[0])) }</p>
      </li>
    )
  )
  const bids = orderBook.bids.sort((a, b) => Number(a[0]) < Number(b[0])).map(
    (bid, index) => (
      <li key={uuidv4()} className='order-book__list-item'>
        <p>{ cutNumber(orderBook.bids[orderBook.bids.length - 1 - index][0], 1) }</p>
        <p
          className={`${
            findRelativePercentage(orderBook.bids[orderBook.bids.length - 1 - index][0], latestCandle.open) >= 0
            ?
            'green'
            :
            'red'
          }`}
        >{(findRelativePercentage(orderBook.bids[orderBook.bids.length - 1 - index][0], latestCandle.open) >= 0 ? '+' : '') + cutNumber(findRelativePercentage(orderBook.bids[orderBook.bids.length - 1 - index][0], latestCandle.open), 2) }</p>
        <p>{ convertToInternationalCurrencySystem((Number(orderBook.bids[orderBook.bids.length - 1 - index][1]) * Number(orderBook.bids[orderBook.bids.length - 1 - index][0]))) }</p>
      </li>
    )
  )

  return (
    <div className='order-book__container'>
      <div className='bids'>
        <ul className='order-book__list'>
          {...bids}
        </ul>
      </div>
      {/* <div>{addPositiveSign(cutNumber(( basisPoints, 2 )))}</div> */}
      <div style={{padding: '0 1em'}} className='order-book__list-item'>
        <p className={`${latestCandle.close > latestCandle.old.close ? 'green' : 'red'}`}>{cutNumber(latestCandle.close, 1)}</p>
        <p style={{ color: `${latestCandle.color}` }}>{(findRelativePercentage(latestCandle.close, latestCandle.open) >= 0 ? '+' : '') + cutNumber(findRelativePercentage(latestCandle.close, latestCandle.open), 2)}</p>
        <p>{convertToInternationalCurrencySystem(latestCandle.volume)}</p>
      </div>
      <div className='asks'>
        <ul className='order-book__list'>
          {...asks}
        </ul>
      </div>
    </div>
  )
}
