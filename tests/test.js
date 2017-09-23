import test from 'ava';
import { Event, User } from '../dist/race-lib.cjs';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

Event.inject('fetch', fetch);
Event.inject('cheerio', cheerio);
User.inject('fetch', fetch);
User.inject('cheerio', cheerio);

process.env.test = true;

test('event', async t => {
  let myEvent = new Event('nonsense_id');
  await myEvent.init().then((evt) => {
    t.is(evt.races.length, 1);
  });
});

test('user', async t => {
  let user = new User('https://batman.org/?goats_cheese=false&person_id=1234');
  await user.initPoints().then((user) => {
    t.is(user.current_club, "Leslie Bike Shop/Bikers Boutique");
  });
});
