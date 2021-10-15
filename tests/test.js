import test from 'ava'
import { Event, User } from '../dist/race-lib.cjs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'

import { injectFixtures } from 'race-fix'

Event.inject('fetch', fetch)
Event.inject('cheerio', cheerio)
User.inject('fetch', fetch)
User.inject('cheerio', cheerio)

injectFixtures(Event)

test('event', async t => {
  const myEvent = new Event('nonsense_id')
  await myEvent.init().then((evt) => {
    t.is(evt.races.length, 1)
  })
})

test('user', async t => {
  const user = new User('https://batman.org/?goats_cheese=false&person_id=1234')
  await user.initPoints().then((user) => {
    t.is(user.current_club, 'Leslie Bike Shop/Bikers Boutique')
  })
})
