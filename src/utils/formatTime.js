export const formatTime = (timeStamp) => {
  const dateObj = new Date(timeStamp)
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds()

  const timeString = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');

  return timeString
}