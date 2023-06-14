import { makeServerRequest } from '../../utils';
import depth from './depth-btcusdt-1000.json' assert { type: 'json' }

const bidPrices = depth.bids.map(bid => {
  return bid[0]
});

console.log(bidPrices)