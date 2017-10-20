[![Build Status](https://travis-ci.org/mrloop/race-lib.svg)](https://travis-ci.org/mrloop/race-lib)

# ⚙ race-lib

Retrieve event data from [britishcycling.org](https://www.britishcycling.org.uk/events/results?keywords=&show=all)

```js
import { Event } from 'race-lib';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

Event.inject('fetch', fetch);
Event.inject('cheerio', cheerio);

Event.upcomming().then((events) => {
  events.forEach( evt => console.log(evt.name));
});
```

See [race-cli](https://github.com/mrloop/race-cli) for example of usage in node and [race-ext](https://github.com/mrloop/race-ext) for browser usage.
