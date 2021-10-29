[![CI](https://github.com/mrloop/race-lib/actions/workflows/ci.yml/badge.svg)](https://github.com/mrloop/race-lib/actions/workflows/ci.yml)
[![Latest NPM release][npm-badge]][npm-badge-url]

[npm-badge]: https://img.shields.io/npm/v/race-lib.svg
[npm-badge-url]: https://www.npmjs.com/package/race-lib

# ⚙ race-lib

Retrieve event data from [britishcycling.org](https://www.britishcycling.org.uk/events/results?keywords=&show=all)

```js
import { Event } from 'race-lib';
import cheerio from 'cheerio';

Event.inject('cheerio', cheerio);

let events = await Event.upcomming();
events.forEach( evt => console.log(evt.name));
```

See [race-cli](https://github.com/mrloop/race-cli) for example of usage in node and [race-ext](https://github.com/mrloop/race-ext) for browser usage.
