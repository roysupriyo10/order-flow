import { createChart, CrosshairMode, ColorType } from "lightweight-charts"
import { useState, useEffect, useRef } from "react"
import { fapi, serverUrl } from "../../utils/"
import ReconnectingWebSocket from 'reconnecting-websocket'
import { cutNumber, addPositiveSign, calcCountdown, determineGreenRed, convertToInternationalCurrencySystem } from "../../utils"
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
        // ticksVisible: false,
        // secondsVisible: false,
      })

      // initialise the websocket with the selected time resolution
      const marketDataSocket = new ReconnectingWebSocket(`${fapi.wss}btcusdt_perpetual@continuousKline_${chartTimeResolution}`)

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

        // const change = addPositiveSign(cutNumber(parseFloat(c) - parseFloat(o), 2))

        // const percentChange = addPositiveSign(cutNumber(( parseFloat(c) - parseFloat(o) ) / parseFloat(o) * 100, 2))


        // // prerequisites to update legend
        // const ohlcLegend = `<div>O<span style="color: ${color}">${parseFloat(o).toFixed(1)}</span></div> <div>H<span style="color: ${color}">${parseFloat(h).toFixed(1)}</span></div> <div>L<span style="color: ${color}">${parseFloat(l).toFixed(1)}</span></div> <div>C<span style="color: ${color}">${parseFloat(c).toFixed(1)}</span></div> <span style="color: ${color}">${change}</span> <span style="color: ${color}">(${percentChange}%)</span>`
        // const volumeLegend = `<span style="font-weight: 400; color: ${color}">${convertToInternationalCurrencySystem(v)}</span>`

        // // updating the legend that displays live candle data
        // if (updateRow !== null) {
        //   updateRow.innerHTML = `<div style="display: flex; column-gap: 8px">${symbolName}&nbsp;&nbsp;<span style="display: flex; align-items: center; column-gap: 8px; font-weight: 400; font-size: 13px;padding-top: 1px; transform: scale(1,1.1)">${ohlcLegend}</span></div><span style="font-family: Open Sans">Vol · BTC</span>&nbsp;&nbsp;${volumeLegend}`
        // }

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
  
        // countDown.innerHTML = calcCountdown(chartTimeResolution)
  
        // timer.style = `
        //   top: ${candleSeriesApi.priceToCoordinate(parseFloat(c)) + 15}px;
        //   background-color: ${determineGreenRed(parseFloat(c) >= parseFloat(o))}
        // `
      }

      // // display the symbol name when no data is received
      // const symbolName = `<span style="font-family: Open Sans; font-size: 16px">Bitcoin / TetherUS PERPETUAL FUTURES · ${chartTimeResolution} · BINANCE</span>`

      // // create the div required to show the countdown timer
      // const timer = document.createElement('div')
      // timer.style = `
      //   position: absolute;
      //   left: ${chartContainerRef.current.clientWidth - 76}px;
      //   top: 45px;
      //   z-index: 4;
      //   color: white;
      //   background-color: #089981;
      //   display: inline;
      //   font-size: 12px;
      //   width: 71px;
      //   display: flex;
      //   justify-content: center;
      //   align-items: center;
      //   border-bottom-right-radius: 3px;
      //   font-family: Azeret Mono
      // `
      // const countDown = document.createElement('div')
      // countDown.innerHTML = 'Hello'

      // timer.appendChild(countDown)

      // chartContainerRef.current.appendChild(timer)

      // // create the required div where the legend will be placed
      // const legend = document.createElement('div');

      // // positioning the legend
      // legend.style = `position: absolute; color: #a6a6a6; font-weight: bold; left: 12px; top: 16px; z-index: 1; font-size: 15px; font-family: 'Azeret Mono'; line-height: 25px;`
      // chartContainerRef.current.appendChild(legend);

      // // two divs to switch on and off alternatively for alternate user action (hovering over candles and when not hovering)
      // const hoverRow = document.createElement('div');
      // const updateRow = document.createElement('div');
      
      // // default configuration to be that user is not hovering over select candles
      // updateRow.innerHTML = symbolName;
      // hoverRow.style.display = 'none';
      // legend.appendChild(hoverRow)
      // legend.appendChild(updateRow)


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