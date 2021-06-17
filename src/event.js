import Race from './race';

import Promise from 'es6-promise';

export default class Event {
  constructor(id, name) {
    this.id = id;
    this.races = [];
    this.error = null;
    if(name) {
      this.name = this.cleanStr(name);
    }
  }

  init() {
    return this.get().then((html) => {
      this.process(html);
      return this;
    });
  }

  fetch() {
    return Event._injected_fetch(`https://www.britishcycling.org.uk/events/details/${this.id}`)
      .then(res => res.text());
  }

  get() {
    if(Event._injected_event_with_entrants_html) {
      return Promise.resolve(Event._injected_event_with_entrants_html);
    } else {
      return this.fetch();
    }
  }

  process(html) {
    let $ = Event._injected_cheerio.load(html);
    this.name = $('.article--event h1').text()
    this.races = $("table:has(.table__th--title)").first().find('.table__th--title').map((i, el) => {
      let raceName = this.cleanName($(el).text());
      let raceId = $(el).find('.load_race_entrants').attr('data-race-id');
      return new Race(raceId, raceName);
    }).toArray();
  }

  cleanName(str) {
    return this.cleanStr(str.replace(/View Entrants/g, ''));
  }

  cleanStr(str) {
    return str.replace(/\s+/g, ' ').trim();
  }

  static inject(attr, obj) {
    let privateVarName = `_injected_${attr}`;
    this[privateVarName] = obj;
    Race.inject(attr, obj);
  }

  static cachePromise(fnc){
    let privateVarName = `_cache_var_${fnc.name}`;
    if(this[privateVarName]){
      return Promise.resolve(this[privateVarName]);
    }
    return fnc.call(this).then((result) => this[privateVarName] = result);
  }

  static upcomming() {
    return this.cachePromise(this._upcomming);
  }

  static getUpcomming() {
    if(Event._injected_events_html) {
      return Promise.resolve(Event._injected_events_html);
    } else {
      return Event._injected_fetch('https://www.britishcycling.org.uk/events?search_type=upcomingevents&zuv_bc_event_filter_id[]=21&resultsperpage=1000').then(res => res.text());
    }
  }

  static _upcomming() {
    return this.getUpcomming(true).then((html) => {
      let $ = Event._injected_cheerio.load(html);
      return $('.article--events__table .events--desktop__row .table__more-label a').map(function(i, node) {
        return new Event($(node).attr('data-event-id'), $(node).text());
      }).toArray();
    });
  }
}
