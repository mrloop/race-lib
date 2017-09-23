import Race from './race';

import Promise from 'es6-promise';

import event_with_entrants_html from '../tests/fixtures/event_with_entrants.html';
import events_html from '../tests/fixtures/events.html';

export default class Event {
  constructor(id, name) {
    this.id = id;
    this.races = [];
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

  load() {
    return Promise.resolve(event_with_entrants_html);
  }

  get() {
    if(typeof process !== "undefined" && process.env.test) {
      return this.load();
    } else {
      return this.fetch();
    }
  }

  process(html) {
    let $ = Event._injected_cheerio.load(html);
    this.name = $('.article--event h1').text()
    this.races = $("table:has('.table__th--title')").first().find('.table__th--title').map((i, el) => {
      let raceName = this.cleanStr($(el).text());
      let raceId = $(el).find('.load_race_entrants').attr('data-race-id');
      return new Race(raceId, raceName);
    }).toArray();
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
    debugger
    if(typeof process !== "undefined" && process.env.test) {
      return Promise.resolve(events_html);
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
