import axios from 'axios'
import { serverUrl } from "../utils"

export const makeServerRequest = async (params, endPoint) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    params: {...params},
    url: serverUrl + '/' + endPoint,
    headers: { }
  }
  const response = await axios.request(config)
  return response.data
}