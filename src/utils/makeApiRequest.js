import { signQueryString } from "./signQueryString"
import { fapi } from "./urls"

export const makeApiRequest = async (params = { }, endPoint = 'ping', isSigned = false) => {
  const baseUrl = fapi.rest
  const queryString = Object.keys(params).map((key, index) => key + '=' + params[key]).join('&')
  const response = await fetch(`${baseUrl}${endPoint}?${queryString}${isSigned ? signQueryString(queryString) : ''}`)
  return await response.json()
}