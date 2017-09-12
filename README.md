[![pipeline status](https://gitlab.com/mrloop/race-lib/badges/master/pipeline.svg)](https://gitlab.com/mrloop/race-lib/commits/master)

# race-lib

Retrieve event data from [britishcycling.org](https://www.britishcycling.org.uk/events/results?keywords=&show=all)

```js
import { Event } from 'race-lib';

Event.upcomming().then((events) => {
  events.forEach( evt => console.log(evt.name));
});
```

See [race-cli](https://gitlab.com/mrloop/race-cli) for more examples.
