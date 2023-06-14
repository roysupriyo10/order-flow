import { createChart, CrosshairMode, ColorType } from "lightweight-charts"
import { useState, useEffect, useRef } from "react"
import { fapi, serverUrl } from "../../urls"
import ReconnectingWebSocket from 'reconnecting-websocket'
import addPositiveSign from "../../utils/addPositiveSign"
import cutNumber from "../../utils/cutNumber"
import axios from 'axios'

const Chart = () => {
  const chartContainerRef = useRef()
  const [ chartTimeResolution, setChartTimeResolution ] = useState('1m')

  useEffect(
    () => {
      console.log('this is run once')
      // create the chart using the lightweight-charts library chart constructor
      const chartApi = createChart(
        chartContainerRef.current,
        //these are the properties according to which the new chart will be created
        {
          width: chartContainerRef.current.clientWidth,
          height: 400,
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
        // ticksVisible: false,
        // secondsVisible: false,
      })

      // initialise the websocket with the selected time resolution
      const marketDataSocket = new ReconnectingWebSocket(`${fapi.wss}ws/btcusdt_perpetual@continuousKline_${chartTimeResolution}`)

      // function that will be called when the websocket connection is established
      marketDataSocket.onopen = async () => {
        // make a request to fetch data from the local server
        const response = await axios.request(
          {
            method: 'get',
            maxBodyLength: Infinity,
            params: {
              timeFrame: chartTimeResolution,
              baseUrl: fapi.rest
            },
            url: serverUrl + '/getAllData',
            headers: { }
          }
        )
        // await response and fetch the JSON part
        const data = await response.data
        // candlestick array to be set to the candleSeriesApi
        const historicalCandles = data.map(candle => ({
          time: ( candle[0] + 19800000 ) / 1000,
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4])
        }))
        // volume bars to correspond with the candlesticks
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

        const { t, o, h, l, c, v } = message.k

        const color = parseFloat(c) >= parseFloat(o) ? '#089981' : '#f23645'

        const change = addPositiveSign(cutNumber(parseFloat(c) - parseFloat(o), 2))


        candleSeriesApi.update({
          time: ( t + 19800000 ) / 1000,
          open: parseFloat(o),
          high: parseFloat(h),
          low: parseFloat(l),
          close: parseFloat(c),
        });

        // this is to update the volumeseries with the parsed data
        volumeSeriesApi.update({
          time: ( t + 19800000 ) / 1000,
          value: parseInt(v),
          color: color === '#089981' ? 'rgba(8, 153, 129, 0.5)' : 'rgba(242, 54, 69, 0.5)'
        });


        // console.log(change)
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
        chartApi.remove()
      }
    },
    [ chartTimeResolution ]
  )

  return (
    <div ref={chartContainerRef}></div>
  )
}

export default Chart