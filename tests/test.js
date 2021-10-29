import { Event, User, setup } from '../src/main.js'
import cheerio from 'cheerio'
import QUnit from 'qunit'

QUnit.module('', function (hooks) {
  hooks.before(async () => {
    await setup({ cheerio, useFixtures: true })
  })

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
})
