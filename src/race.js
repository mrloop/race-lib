import User from './user';

import Promise from 'es6-promise';

import entrants_html from '../tests/fixtures/entrants.html';

export default class Race {
  constructor(id, name) {
    this.name = name;
    this.id = id;
  }

  toString() {
    return `{ id: ${this.id}, name: ${this.name} }`;
  }

  fetchEntrants() {
    return Race._injected_fetch(`https://www.britishcycling.org.uk/events_version_2/ajax_race_entrants_dialog?race_id=${this.id}`)
      .then(res => res.text())
  }

  loadEntrants() {
    return Promise.resolve(entrants_html);
  }

  getEntrants(race_id) {
    if(typeof process !== "undefined" && process.env.test) {
      return this.loadEntrants();
    } else {
      return this.fetchEntrants(race_id);
    }
  }

  processEntrants(html) {
    let $ = Race._injected_cheerio.load(html);
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

  static inject(attr, obj) {
    let privateVarName = `_injected_${attr}`;
    this[privateVarName] = obj;
    User.inject(attr, obj);
  }
}
