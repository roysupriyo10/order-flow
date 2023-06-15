import React from 'react'
import './selector.css'
import { convertToInternationalCurrencySystem, cutNumber, findRelativePercentage, formatTime, generateArray } from '../../utils'
import { v4 as uuidv4 } from 'uuid'
import { useEffect, useMemo } from 'react'
import { useState } from 'react'


export const Selector = ({ recentTradesStore, allOrderBookSnapshots }) => {
  // const bars = generateArray(1, 60, 1)



  const shortenedTrades = recentTradesStore.slice(recentTradesStore.length - 50, recentTradesStore.length - 45)
  // const shortenedOrderBook = allOrderBookSnapshots.slice(allOrderBookSnapshots.length - 5, allOrderBookSnapshots.length)
  const shortenedOrderBook = allOrderBookSnapshots.slice(0, 15)
  // console.log(shortenedTrades, shortenedOrderBook)

  // useEffect(() => JSON.parse(localStorage.getItem('shortenedOrderBook')) ?? [])


  const differences = shortenedOrderBook.map((orderBookSnap, index1) => {

    const asksSorted = orderBookSnap.asks.sort((a, b) => - Number(a[0]) + Number(b[0]))
    const bidsSorted = orderBookSnap.bids.sort((a, b) => Number(a[0]) - Number(b[0]))



    
    if (index1 !== 0) {     
      const shortenedOrderBookSortedBids = [...shortenedOrderBook][index1 - 1].bids.sort((a, b) => Number(a[0]) - Number(b[0]))
      
      const currentBidPrice = bidsSorted[bidsSorted.length - 1][0]
      const currentBidAmount = convertToInternationalCurrencySystem(bidsSorted[bidsSorted.length - 1][1] * currentBidPrice)
      const previousBidPrice = shortenedOrderBookSortedBids[shortenedOrderBookSortedBids.length - 1][0]
      const previousBidAmount = convertToInternationalCurrencySystem(shortenedOrderBookSortedBids[shortenedOrderBookSortedBids.length - 1][1] * previousBidPrice)

      // console.log( previousBidPrice, previousBidAmount, currentBidPrice, currentBidAmount, index1 )

      return ((Number(currentBidPrice) * 10) - (Number(previousBidPrice) * 10)) / 10
    } else {
      return 0
    }
  })

  const orderBooks = shortenedOrderBook.map((orderBookSnap, index1) => {

    const asksSorted = orderBookSnap.asks.sort((a, b) => - Number(a[0]) + Number(b[0]))
    const bidsSorted = orderBookSnap.bids.sort((a, b) => Number(a[0]) - Number(b[0]))

    
    if (index1 !== 0) {     
      const shortenedOrderBookSortedBids = [...shortenedOrderBook][index1 - 1].bids.sort((a, b) => Number(a[0]) - Number(b[0]))
      
      const currentBidPrice = bidsSorted[bidsSorted.length - 1][0]
      const currentBidAmount = convertToInternationalCurrencySystem(bidsSorted[bidsSorted.length - 1][1] * currentBidPrice)
      const previousBidPrice = shortenedOrderBookSortedBids[shortenedOrderBookSortedBids.length - 1][0]
      const previousBidAmount = convertToInternationalCurrencySystem(shortenedOrderBookSortedBids[shortenedOrderBookSortedBids.length - 1][1] * previousBidPrice)

      // console.log( previousBidPrice, previousBidAmount, currentBidPrice, currentBidAmount, index1 )

      const difference = ((Number(currentBidPrice) * 10) - (Number(previousBidPrice) * 10)) / 10

      // console.log(difference)

      bidsSorted.forEach((bid, index2) => {
        // console.log([...shortenedOrderBook][index - 1].bids.sort((a, b) => Number(a[0]) - Number(b[0]))[index][0])

        // console.log(
        //   index1,
        //   index2,
        //   previousBidPrice, // prev bid price
        //   convertToInternationalCurrencySystem(previousBidPrice * previousBidAmount), // prev bid amount
        //   currentBidPrice, // current bid price
        //   convertToInternationalCurrencySystem(currentBidPrice * currentBidAmount) // current bid amount
        // )

        if (currentBidPrice === previousBidPrice) {

        }

      })
    }

    // bidsSorted.forEach((bid, index) => {
    //   if (asksSorted[index][0] > bid[0]) { console.log('greater') }
    // })

    const asks = orderBookSnap.asks.sort((a, b) => - Number(a[0]) + Number(b[0])).map(
      ask => (
        <li key={uuidv4()} className='order-book__list-item'>
          <p>{ cutNumber(ask[0], 1) }</p>
          {/* <p className={`${findRelativePercentage(ask[0], latestCandle.open) >= 0 ? 'green' : 'red'}`}>{ (findRelativePercentage(ask[0], latestCandle.open) >= 0 ? '+' : '') + cutNumber(findRelativePercentage(ask[0], latestCandle.open), 2) }</p> */}
          <p>{ convertToInternationalCurrencySystem(Number(ask[1]) * Number(ask[0])) }</p>

        </li>
      )
    )
    const bids = orderBookSnap.bids.sort((a, b) => Number(a[0]) - Number(b[0])).map(
      (bid, index) => (
        <li key={uuidv4()} className='order-book__list-item'>
          <p>{ cutNumber(orderBookSnap.bids[orderBookSnap.bids.length - 1 - index][0], 1) }</p>
          {/* <p
            className={`${
              findRelativePercentage(orderBookSnap.bids[orderBookSnap.bids.length - 1 - index][0], latestCandle.open) >= 0
              ?
              'green'
              :
              'red'
            }`}
          >{(findRelativePercentage(orderBookSnap.bids[orderBookSnap.bids.length - 1 - index][0], latestCandle.open) >= 0 ? '+' : '') + cutNumber(findRelativePercentage(orderBookSnap.bids[orderBookSnap.bids.length - 1 - index][0], latestCandle.open), 2) }</p> */}
          <p>{ convertToInternationalCurrencySystem((Number(orderBookSnap.bids[orderBookSnap.bids.length - 1 - index][1]) * Number(orderBookSnap.bids[orderBookSnap.bids.length - 1 - index][0]))) }</p>

        </li>
      )
    )
    return (
      <div className='order-book__container-list' key={uuidv4()}>
        <div>{`${formatTime(orderBookSnap.time)} ms: ${orderBookSnap.time % 1000}`}</div>
        <div className='asks'>
          <ul className='order-book__list'>
            {...asks}
          </ul>
        </div>
        <div></div>
        <div className='bids'>
          <ul className='order-book__list'>
            {...bids}
          </ul>
        </div>
      </div>
    )
  })

  const memoOrderBooks = useMemo(() => orderBooks, [shortenedOrderBook])

  console.log(shortenedTrades)

  return (
    <div className='selector'>
      {memoOrderBooks}
    </div>
  )
}