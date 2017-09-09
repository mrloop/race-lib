'use strict';

const User = require('./user');

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

module.exports = class Race {
  constructor(id, name) {
    this.name = name;
    this.id = id;
  }

  toString() {
    return `{ id: ${this.id}, name: ${this.name} }`;
  }

  fetchEntrants() {
    return fetch(`https://www.britishcycling.org.uk/events_version_2/ajax_race_entrants_dialog?race_id=${this.id}`)
      .then(res => res.text())
  }

  loadEntrants() {
    return fs.readFileAsync(path.join(__dirname, 'tests', 'fixtures', 'entrants.html')).then( file => file.toString())
  }

  getEntrants(race_id) {
    if(process.env.test) {
      return this.loadEntrants();
    } else {
      return this.fetchEntrants(race_id);
    }
  }

  processEntrants(html) {
    let $ = cheerio.load(html);
    return $("table[summary='List of entrants in this race'] tbody tr").map((i, el)=> {
      return $(el).find('a').first().attr('href');
    }).filter((el) => { return !!el }).map((i, href) => {
      return new User(href);
    });
  }

  initEntrants() {
    return this.getEntrants(this.id).then((html) => {
      return this.processEntrants(html);
    }).then((users) => {
      return this._users = users.toArray();
    });
  }

  entrants() {
    if(this._users) {
      return Promise.resolve(this._users);
    }
    return this.initEntrants().then((entrants) => {
      //want point promises to settle
      return Promise.all(entrants.map((entrant) => {
        return entrant.pointsPromise;
      })).then(() => {
        return this._users = User.sort(this._users);
      });
    })
  }
}
