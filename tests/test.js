'use strict';

import test from 'ava';

process.env.test = true;


const { Event } = require('../index');

test('event', async t => {
  let myEvent = new Event('nonsense_id');
  await myEvent.init().then((evt) => {
    t.is(evt.races.length, 1);
  });
});


const { User } = require('../index');

test('user', async t => {
  let user = new User('1234');
  await user.initPoints().then((user) => {
    t.is(user.current_club, "Leslie Bike Shop/Bikers Boutique");
  });
});
