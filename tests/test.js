import { Event, User } from '../src/main.js'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import QUnit from 'qunit'

import { injectFixtures } from 'race-fix'

Event.inject('fetch', fetch)
Event.inject('cheerio', cheerio)
User.inject('fetch', fetch)
User.inject('cheerio', cheerio)

injectFixtures(Event)

QUnit.test('event', async assert => {
  const myEvent = new Event('nonsense_id')
  const { races } = await myEvent.init()
  assert.equal(races.length, 1)
})

QUnit.test('user', async assert => {
  const user = new User('https://batman.org/?goats_cheese=false&person_id=1234')
  const { current_club: currentClub } = await user.initPoints()
  assert.equal(currentClub, 'Leslie Bike Shop/Bikers Boutique')
})
