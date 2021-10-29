import crossFetch from 'cross-fetch'
import delayFetch from './delay-fetch.js'
import serialFetch from 'serial-fetch'

const serial = serialFetch.default || serialFetch
const serialDelayedFetch = serial(delayFetch(crossFetch, 4000))

export default function fetch () {
  return serialDelayedFetch.apply(this, arguments)
}
