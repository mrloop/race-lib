import { Event, User } from '../src/main.js'
import cheerio from 'cheerio'
import fetch from 'node-fetch'

import { injectFixtures } from 'race-fix'

Event.inject('fetch', fetch)
Event.inject('cheerio', cheerio)
User.inject('fetch', fetch)
User.inject('cheerio', cheerio)

injectFixtures(Event)

QUnit.test('event', async t => {
  const myEvent = new Event('nonsense_id')
  await myEvent.init().then((evt) => {
    t.equal(evt.races.length, 1)
  })
})

QUnit.test('user', async t => {
  const user = new User('https://batman.org/?goats_cheese=false&person_id=1234')
  await user.initPoints().then((user) => {
    t.equal(user.current_club, 'Leslie Bike Shop/Bikers Boutique')
  })
})
