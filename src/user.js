import Promise from 'es6-promise'
import { parse } from 'uri-js'
import serialFetch from 'serial-fetch'
import delayFetch from './delay-fetch.js'

const DEFAULT_NUM = 999

export default class User {
  constructor (href, name, signal) {
    this.id = this.idFromUrl(href)// 3; //new URI(href).search(true).person_id;
    this.name = name || ''
    this.signal = signal
    this.points_href = href
    this.points_loaded = false
    this.pointsPromise = this.initPoints()
    this.regional_rank = DEFAULT_NUM
    this.national_rank = DEFAULT_NUM
  }

  idFromUrl (url) {
    return parse(url).query.split('&').find(kv => {
      return kv.split('=')[0] === 'person_id'
    }).split('=')[1]
  }

  fetchPoints () {
    return User._injected_fetch(`https://www.britishcycling.org.uk/${this.points_href}`, { signal: this.signal })
      .then(res => {
        if (res.status >= 400) {
          this.error = res.statusText
          throw res.statusText
        }
        return res.text()
      })
  }

  getPoints () {
    if (User._injected_person_html) {
      return Promise.resolve(User._injected_person_html)
    } else {
      return this.fetchPoints()
    }
  }

  initPoints () {
    return this.getPoints().then(body => {
      this.points_loaded = true
      const $ = User._injected_cheerio.load(body)
      $('dd').each((i, el) => {
        this.parseDd($(el).text())
      })
      if ($('main h1').text().split(':')[1]) {
        this.name = this.name || $('main h1').text().split(':')[1].trim()
      }
      return this
    })
  }

  parseDd (str) {
    const arr = str.split(':')
    arr[1] = arr[1].trim()
    switch (arr[0]) {
      case 'Current Club':
        this.current_club = arr[1]
        break
      case 'Gender':
        this.gender = arr[1]
        break
      case 'Age Category':
        this.age_cateogry = arr[1]
        break
      case 'Category':
        this.category = arr[1]
        break
      case 'National Rank':
        this.national_rank = Number(arr[1]) || DEFAULT_NUM
        break
      case 'Regional Rank':
        if (User._fakeRank) {
          this.regional_rank = [...this.name].reduce((a, c) => a + c.charCodeAt(), 0)
        } else {
          this.regional_rank = Number(arr[1]) || DEFAULT_NUM
        }
        break
      case 'Regional Points':
        this.regional_points = Number(arr[1]) || DEFAULT_NUM
        break
      case 'National Points':
        this.national_points = Number(arr[1]) || DEFAULT_NUM
        break
    }
  }

  static compareFnc (a, b) {
    if (a.national_rank !== DEFAULT_NUM || b.national_rank !== DEFAULT_NUM) {
      return a.national_rank - b.national_rank
    } else if (a.regional_rank !== DEFAULT_NUM || b.regional_rank !== DEFAULT_NUM) {
      return a.regional_rank - b.regional_rank
    } else {
      return a.name.localeCompare(b.name)
    }
  }

  static sort (users) {
    return users.sort(this.compareFnc)
  }

  static inject (attr, obj) {
    const privateVarName = `_injected_${attr}`
    this._fakeRank = true
    if (attr === 'fetch') {
      if (typeof serialFetch === 'function') {
        obj = serialFetch(delayFetch(obj, 4000))
      } else { // shouldn't be necessary - issue with rollup?
        obj = serialFetch.default(delayFetch(obj, 4000))
      }
    }
    this[privateVarName] = obj
  }
}
