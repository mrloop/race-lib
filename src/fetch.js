import crossFetch from 'cross-fetch'
import delayFetch from './delay-fetch.js'
import serialFetch from 'serial-fetch'
import { requestDelay } from './config.js'

const serial = serialFetch.default || serialFetch
const serialDelayedFetch = serial(function () {
  // defer calling delayFetch so config setup can be called
  return delayFetch(crossFetch, requestDelay).apply(this, arguments)
})

export default function fetch () {
  return serialDelayedFetch.apply(this, arguments)
}
