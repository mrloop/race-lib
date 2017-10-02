import test from 'ava';
import { Event, User } from '../dist/race-lib.cjs';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

import { events_html, event_with_entrants_html, person_html } from 'race-fix';

Event.inject('fetch', fetch);
Event.inject('cheerio', cheerio);
Event.inject('event_with_entrants_html', event_with_entrants_html);
Event.inject('events_html', events_html);

User.inject('fetch', fetch);
User.inject('cheerio', cheerio);
User.inject('person_html', person_html);

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
