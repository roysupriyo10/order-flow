export const cutNumber = (number, digitsAfterDot) => {
  if (Number(number) % 1 == 0) {
    return Number(number).toFixed(digitsAfterDot)
  }
  const str = `${number}`
  return Number(str.slice(0, str.indexOf('.') + digitsAfterDot + 1)).toFixed(digitsAfterDot)
}