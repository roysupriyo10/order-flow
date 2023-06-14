import { createChart, CrosshairMode, ColorType } from "lightweight-charts"
import { useState, useEffect, useRef } from "react"

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