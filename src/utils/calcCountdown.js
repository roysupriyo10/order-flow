import { timeFrameIdentifier } from "./timeFrameIdentifier"

export const calcCountdown = (timeFrame) => {

// fetch the remaining seconds to the close of the current candle
const remainingSeconds = (timeFrameIdentifier[timeFrame] - ((parseInt(new Date().getTime() / 1000)) % timeFrameIdentifier[timeFrame]))

// format the remaining seconds in the required format to display in the countdown timer div
const dateObj = new Date(remainingSeconds * 1000)
const minutes = dateObj.getUTCMinutes();
const seconds = dateObj.getSeconds();
const hours = dateObj.getUTCHours()

const timeString = (timeFrameIdentifier[timeFrame] >= 7200 ? hours.toString().padStart(2, '0') + ':' : '') + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
return timeString
}