import { useState, useEffect, useRef } from 'react'
import { OrderBook, LatestTrades, Selector } from './components'
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts'
import { fapi, formatTime, cutNumber, convertToInternationalCurrencySystem, makeApiRequest } from './utils'
import './App.css'


import ReconnectingWebSocket from 'reconnecting-websocket'


function App() {
  const [ orderBook, setOrderBook ] = useState({bids: [], asks: []})
  const [ recentTrades, setRecentTrades ] = useState([])
  const [ recentTradesStore, setRecentTradesStore ] = useState([])

  const chartContainerRef = useRef()
  const [ chartTimeResolution, setChartTimeResolution ] = useState('1m')

  const [ latestCandle, setLatestCandle ] = useState({
    old: {
      time: 0,
      open: 0,
      high: 0,
      low: 0,
      close: 0,
      volume: 0,
      color: '#089981'
    },
    time: 0,
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    volume: 0,
    color: '#089981'
  })

  const [ allOrderBookSnapshots, setAllOrderBookSnapshots ] = useState([])

  const [ times, setTimes ] = useState({ orders: 0, trades: 0 })

  // console.log('order-book: ' + allOrderBookSnapshots.length, 'trade-list: ' + recentTrades.length, 'diff: ' + (recentTrades.length - allOrderBookSnapshots.length))
  // console.log(times, times.orders === times.trades)

  useEffect(
    () => {
      const depthSocket = new ReconnectingWebSocket(`${fapi.wss}ws/btcusdt@depth20@100ms`)

      depthSocket.onopen = () => console.log(`Connection to depth socket has been established...`)
      depthSocket.onclose = (error) => console.log(`Connection to depth socket has been closed. Reason: ${error}`)

      depthSocket.onmessage = (event) => {
        const { b, a, T } = JSON.parse(event.data)
        setAllOrderBookSnapshots(prevList => [...prevList, { bids: b, asks: a, time: T }])
        setOrderBook({ bids: b, asks: a })
      }

      const latestTradesSocket = new ReconnectingWebSocket(`${fapi.wss}ws/btcusdt@aggTrade`)

      latestTradesSocket.onopen = () => console.log(`Connection with trades websocket is open...`)
      latestTradesSocket.onclose = (error) => console.log(`Connection with trades websocket is close. Reason: ${error}`)

      latestTradesSocket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        setRecentTradesStore(prevStore => {
          return ([
            {
              time: formatTime(message.T),
              price: message.p,
              amount: cutNumber(Number(message.p) * Number(message.q), 2),
              color: Number(message.p) > Number(prevStore.at(0).price) ? '#089981' : '#f23645'
            },
            ...prevStore
          ])
        })
        setRecentTrades(prevTrades => {
          if (prevTrades.length > 149) {
            prevTrades.splice(149, prevTrades.length)
          }
          return ([
            {
              time: `${formatTime(message.T)} ms: ${message.T % 1000}`,
              price: message.p,
              amount: cutNumber(Number(message.p) * Number(message.q), 2),
              color: Number(message.p) > Number(prevTrades.at(0).price) ? '#089981' : '#f23645'
            },
            ...prevTrades
          ])
        })
      }
      console.log('this is run once')
      // create the chart using the lightweight-charts library chart constructor
      const chartApi = createChart(
        chartContainerRef.current,
        //these are the properties according to which the new chart will be created
        {
          width: chartContainerRef.current.clientWidth,
          height: 500,
          // color: 'white',
          crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: {
              color: '#9598A1'
            },
            horzLine: {
              color: '#9598A1'
            }
          },
          layout: {
            background: {
              type: ColorType.VerticalGradient,
              topColor: '#0c0c0c',
              bottomColor: '#000000'
            },
            textColor: 'white',
            fontFamily: 'Azeret Mono',
          },
          grid: {
            vertLines: {
              color: '#242832',
            },
            horzLines: {
              color: '#242832',
            },
          },
          rightPriceScale: {
            borderColor: '#242832',
          },
          //timescale properties that dictate that the seconds while hovering are visible
          timeScale: {
            borderColor: '#242832',
            timeVisible: true,
            secondsVisible: false
          },
          handleScroll: false,
          handleScale: false,
        }
      )

      //detect a resize event and resize the width of the chart accordingly
      const handleResize = () => {
        chartApi.applyOptions({ width: chartContainerRef.current.clientWidth });
      };
      window.addEventListener('resize', handleResize);

      //creating candleseries containing the candlestick data with following properties
      const candleSeriesApi = chartApi.addCandlestickSeries({
        upColor: '#089981',
        downColor: '#F23645',
        borderDownColor: '#F23645',
        borderUpColor: '#089981',
        wickDownColor: '#F23645',
        wickUpColor: '#089981',
        priceFormat: {
          type: 'price',
          precision: 1
        }
      })

      //creating volume series containing the volume bars with the following properties
      const volumeSeriesApi = chartApi.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceLineVisible: false,
        priceScaleId: '', // set as an overlay by setting a blank priceScaleId
      });

      //adjusting the margin to ensure that the volume bars and candlesticks don't overlap each other
      candleSeriesApi.priceScale().applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.08
        }
      })

      //adjusting the margin to ensure that the candlesticks and volume bars don't overlap each other
      volumeSeriesApi.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8, // highest point of the series will be 90% away from the top
          bottom: 0,
        },
      })

      // initialise the websocket with the selected time resolution
      const marketDataSocket = new ReconnectingWebSocket(`${fapi.wss}ws/btcusdt_perpetual@continuousKline_${chartTimeResolution}`)

      // function that will be called when the websocket connection is established
      marketDataSocket.onopen = async () => {
        const data = await makeApiRequest({
          pair: 'BTCUSDT',
          contractType: 'PERPETUAL',
          interval: chartTimeResolution,
          limit: '1500'
        }, 'continuousKlines')

        const historicalCandles = data.map(candle => ({
          time: ( candle[0] + 19800000 ) / 1000,
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4])
        }))

        const historicalVolume = data.map(candle => ({
          time: ( candle[0] + 19800000 ) / 1000,
          value: parseInt(candle[5]),
          color: parseFloat(candle[4]) >= parseFloat(candle[1]) ? 'rgba(8, 153, 129, 0.5)' : 'rgba(242, 54, 69, 0.5)'
        }))
        // set the relevant data to the chart
        candleSeriesApi.setData(historicalCandles)
        volumeSeriesApi.setData(historicalVolume)
      }

      // function that will be called when a new message is received from the websocket
      marketDataSocket.onmessage = (event) => {
        // parsing the JSON payload containing the candlesticks
        const message = JSON.parse(event.data)

        const { t, o, h, l, c, v, q } = message.k

        const color = parseFloat(c) >= parseFloat(o) ? '#089981' : '#f23645'

        const newCandle = {
          time: ( t + 19800000 ) / 1000,
          open: parseFloat(o),
          high: parseFloat(h),
          low: parseFloat(l),
          close: parseFloat(c),
        }

        setLatestCandle(prevCandle => {
          return ({
            old: prevCandle,
            ...newCandle,
            volume: parseInt(q),
            color
          })
        })

        candleSeriesApi.update(newCandle);

        // this is to update the volumeseries with the parsed data
        volumeSeriesApi.update({
          time: ( t + 19800000 ) / 1000,
          value: parseInt(v),
          color: color === '#089981' ? 'rgba(8, 153, 129, 0.5)' : 'rgba(242, 54, 69, 0.5)'
        });
      }

      setTimeout(() => {
        chartApi.applyOptions(
          {
            handleScroll: true,
            handleScale: true
          }
        )
      }, 2000);

      return () => {
        depthSocket.close()
        latestTradesSocket.close()
        chartApi.remove()
        marketDataSocket.close()
      }
    },
    []
  )

  const props = {
    orderBook,
    setOrderBook,
    recentTrades,
    setRecentTrades,
    latestCandle,
    allOrderBookSnapshots,
    recentTradesStore,
    setRecentTradesStore
  }

  return (
    <>
      <div ref={chartContainerRef} className="chart__container"></div>
      <OrderBook {...props} />
      <LatestTrades {...props} />
      <Selector {...props} />
    </>
  )
}

export default App
