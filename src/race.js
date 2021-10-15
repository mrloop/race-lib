import User from './user'

import Promise from 'es6-promise'
import AbortControllerImpl from 'abort-controller'
import { EventTarget, defineEventAttribute } from 'event-target-shim'

export default class Race extends EventTarget {
  constructor (id, name) {
    super()
    this.name = name
    this.id = id
  }

  toString () {
    return `{ id: ${this.id}, name: ${this.name} }`
  }

  fetchEntrants () {
    return Race._injected_fetch(`https://www.britishcycling.org.uk/events_version_2/ajax_race_entrants_dialog?race_id=${this.id}`)
      .then(res => res.text())
  }

  getEntrants (raceId) {
    if (Race._injected_entrants_html) {
      return Promise.resolve(Race._injected_entrants_html)
    } else {
      return this.fetchEntrants(raceId)
    }
  }

  processEntrants (html, signal) {
    const $ = Race._injected_cheerio.load(html)
    return $("table[summary='List of entrants in this race'] tbody tr").map((_, el) => {
      const link = $(el).find('a').first()
      return { href: link.attr('href'), name: link.text().trim() }
    }).filter((_, el) => { return !!el.href }).map((_, details) => {
      return new User(details.href, details.name, signal)
    })
  }

  initEntrants (signal) {
    return this.getEntrants(this.id).then((html) => {
      return this.processEntrants(html, signal)
    }).then((users) => {
      this._users = users.toArray()
      return this._users
    })
  }

  // return users promise without waiting for users points promises to resolve
  // for more response UI. Use this in favour of `entrants`. Keeping `entrants` for use
  // in race-ext glimmerjs app, could be removed if race-ext glimmerjs app updated
  users () {
    if (!this._usersPromise) {
      this._usersPromise = this.initEntrants()
    }
    return this._usersPromise
  }

  entrants () {
    if (this._users) {
      return Promise.resolve(this._users)
    }

    if (this._allPromise) {
      return this._allPromise
    }

    let abortController = new AbortControllerImpl()
    if (typeof AbortController !== 'undefined') {
      abortController = new AbortController()
    }
    const signal = abortController.signal

    this._allPromise = this.initEntrants(signal).then((entrants) => {
      this.setupNotifications(entrants)
      // want point promises to settle
      return Promise.all(entrants.map((entrant) => {
        return entrant.pointsPromise
      })).then(() => {
        this._users = User.sort(this._users)
        return this._users
      }).catch((err) => {
        abortController.abort() // cancels all other fetches
        /* eslint-disable-next-line no-throw-literal */
        throw { message: err, users: this._users }
      })
    })
    return this._allPromise
  }

  setupNotifications (entrants) {
    let count = 0

    this.dispatchEvent({ type: 'entrantLoaded', detail: { users: this._users, loaded: count, total: entrants.length } })

    entrants.forEach(entrant => {
      entrant.pointsPromise.then(() => {
        count = count + 1
        this.dispatchEvent({ type: 'entrantLoaded', detail: { users: User.sort(this._users), loaded: count, total: entrants.length } })
      }).catch(err => {
        this.dispatchEvent({ type: 'entrantError', detail: { user: entrant, error: err } })
      })
    })
  }

  static inject (attr, obj) {
    const privateVarName = `_injected_${attr}`
    this[privateVarName] = obj
    User.inject(attr, obj)
  }
}

defineEventAttribute(Race.prototype, 'entrantLoaded')
defineEventAttribute(Race.prototype, 'entrantError')
