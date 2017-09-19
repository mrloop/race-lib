'use strict';

const Race = require('./race');

const URI = require('urijs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');


module.exports = class Event {
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
    return fetch(`https://www.britishcycling.org.uk/events/details/${this.id}`)
      .then(res => res.text());
  }

  load() {
    return fs.readFileAsync(path.join(__dirname, '..','tests', 'fixtures', 'event_with_entrants.html')).then( file => file.toString());
  }

  get() {
    if(process.env.test) {
      return this.load();
    } else {
      return this.fetch();
    }
  }

  process(html) {
    let $ = cheerio.load(html);
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
    if(process.env.test) {
      return fs.readFileAsync(path.join(__dirname, 'tests', 'fixtures', 'events.html')).then( file => file.toString());
    } else {
      return fetch('https://www.britishcycling.org.uk/events?search_type=upcomingevents&zuv_bc_event_filter_id[]=21&resultsperpage=1000').then(res => res.text());
    }
  }

  static _upcomming() {
    return this.getUpcomming(true).then((html) => {
      let $ = cheerio.load(html);
      return $('.article--events__table .events--desktop__row .table__more-label a').map(function(i, node) {
        return new Event($(node).attr('data-event-id'), $(node).text());
      }).toArray();
    });
  }
}
