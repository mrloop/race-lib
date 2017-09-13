'use strict';

import test from 'ava';
import { Event, User } from '../index';

process.env.test = true;


test('event', async t => {
  let myEvent = new Event('nonsense_id');
  await myEvent.init().then((evt) => {
    t.is(evt.races.length, 1);
  });
});

test('user', async t => {
  let user = new User('1234');
  await user.initPoints().then((user) => {
    t.is(user.current_club, "Leslie Bike Shop/Bikers Boutique");
  });
});
