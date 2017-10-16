import Promise$1 from 'es6-promise';
import { parse } from 'uri-js';
import serialFetch from 'serial-fetch';
import AbortController from 'abort-controller';

function delayFetch(originalFetch, delay) {

  return function fetch(input, init) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        //bit of work around for delayed serialized requests and abort.
        //manually check in signal.abort has been called as fetch wouldn't have existed when first called
        if (init.signal && init.signal.aborted) {
          reject({ name: 'AbortError' });
        } else {
          originalFetch(input, init).then(resolve).catch(reject);
        }
      }, delay);
    });
  };
}

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

//import URI from 'urijs';
var DEFAULT_NUM = 999;

var User = function () {
  function User(href, name, signal) {
    classCallCheck(this, User);

    this.id = this.idFromUrl(href); //3; //new URI(href).search(true).person_id;
    this.name = name;
    this.signal = signal;
    this.points_href = href;
    this.pointsPromise = this.initPoints();
    this.regional_rank = DEFAULT_NUM;
    this.national_rank = DEFAULT_NUM;
  }

  createClass(User, [{
    key: 'idFromUrl',
    value: function idFromUrl(url) {
      return parse(url).query.split('&').find(function (kv) {
        return kv.split('=')[0] === 'person_id';
      }).split('=')[1];
    }
  }, {
    key: 'fetchPoints',
    value: function fetchPoints() {
      var _this = this;

      return User._injected_fetch('https://www.britishcycling.org.uk/' + this.points_href, { signal: this.signal }).then(function (res) {
        if (res.status >= 400) {
          _this.error = res.statusText;
          throw res.statusText;
        }
        return res.text();
      });
    }
  }, {
    key: 'getPoints',
    value: function getPoints() {
      if (User._injected_person_html) {
        return Promise$1.resolve(User._injected_person_html);
      } else {
        return this.fetchPoints();
      }
    }
  }, {
    key: 'initPoints',
    value: function initPoints() {
      var _this2 = this;

      return this.getPoints().then(function (body) {
        var $ = User._injected_cheerio.load(body);
        $('dd').each(function (i, el) {
          _this2.parseDd($(el).text());
        });
        if ($('main h1').text().split(':')[1]) {
          _this2.name = $('main h1').text().split(':')[1].trim();
        }
        return _this2;
      });
    }
  }, {
    key: 'parseDd',
    value: function parseDd(str) {
      var arr = str.split(':');
      arr[1] = arr[1].trim();
      switch (arr[0]) {
        case 'Current Club':
          this.current_club = arr[1];
          break;
        case 'Gender':
          this.gender = arr[1];
          break;
        case 'Age Category':
          this.age_cateogry = arr[1];
          break;
        case 'Category':
          this.category = arr[1];
          break;
        case 'National Rank':
          this.national_rank = Number(arr[1]) || DEFAULT_NUM;
          break;
        case 'Regional Rank':
          this.regional_rank = Number(arr[1]) || DEFAULT_NUM;
          break;
        case 'Regional Points':
          this.regional_points = Number(arr[1]) || DEFAULT_NUM;
          break;
        case 'National Points':
          this.national_points = Number(arr[1]) || DEFAULT_NUM;
          break;
      }
    }
  }], [{
    key: 'compareFnc',
    value: function compareFnc(a, b) {
      if (a.national_rank !== DEFAULT_NUM || b.national_rank !== DEFAULT_NUM) {
        return a.national_rank - b.national_rank;
      } else if (a.regional_rank !== DEFAULT_NUM || b.regional_rank !== DEFAULT_NUM) {
        return a.regional_rank - b.regional_rank;
      }
      return 0;
    }
  }, {
    key: 'sort',
    value: function sort(users) {
      return users.sort(this.compareFnc);
    }
  }, {
    key: 'inject',
    value: function inject(attr, obj) {
      var privateVarName = '_injected_' + attr;
      if (attr === 'fetch') {
        obj = serialFetch(delayFetch(obj, 2000));
      }
      this[privateVarName] = obj;
    }
  }]);
  return User;
}();

var Race = function () {
  function Race(id, name) {
    classCallCheck(this, Race);

    this.name = name;
    this.id = id;
  }

  createClass(Race, [{
    key: 'toString',
    value: function toString() {
      return '{ id: ' + this.id + ', name: ' + this.name + ' }';
    }
  }, {
    key: 'fetchEntrants',
    value: function fetchEntrants() {
      return Race._injected_fetch('https://www.britishcycling.org.uk/events_version_2/ajax_race_entrants_dialog?race_id=' + this.id).then(function (res) {
        return res.text();
      });
    }
  }, {
    key: 'getEntrants',
    value: function getEntrants(race_id) {
      if (Race._injected_entrants_html) {
        return Promise$1.resolve(Race._injected_entrants_html);
      } else {
        return this.fetchEntrants(race_id);
      }
    }
  }, {
    key: 'processEntrants',
    value: function processEntrants(html, signal) {
      var $ = Race._injected_cheerio.load(html);
      return $("table[summary='List of entrants in this race'] tbody tr").map(function (i, el) {
        var link = $(el).find('a').first();
        return { href: link.attr('href'), name: link.text().trim() };
      }).filter(function (i, el) {
        return !!el.href;
      }).map(function (i, details) {
        return new User(details.href, details.name, signal);
      });
    }
  }, {
    key: 'initEntrants',
    value: function initEntrants(signal) {
      var _this = this;

      return this.getEntrants(this.id).then(function (html) {
        return _this.processEntrants(html, signal);
      }).then(function (users) {
        return _this._users = users.toArray();
      });
    }
  }, {
    key: 'entrants',
    value: function entrants() {
      var _this2 = this;

      if (this._users) {
        return Promise$1.resolve(this._users);
      }

      if (this._allPromise) {
        return this._allPromise;
      }

      var abortController = new AbortController();
      var signal = abortController.signal;

      this._allPromise = this.initEntrants(signal).then(function (entrants) {
        //want point promises to settle
        return Promise$1.all(entrants.map(function (entrant) {
          return entrant.pointsPromise;
        })).then(function () {
          return _this2._users = User.sort(_this2._users);
        }).catch(function (err) {
          abortController.abort(); //cancels all other fetches
          throw { message: err, users: _this2._users };
        });
      });
      return this._allPromise;
    }
  }], [{
    key: 'inject',
    value: function inject(attr, obj) {
      var privateVarName = '_injected_' + attr;
      this[privateVarName] = obj;
      User.inject(attr, obj);
    }
  }]);
  return Race;
}();

var Event = function () {
  function Event(id, name) {
    classCallCheck(this, Event);

    this.id = id;
    this.races = [];
    this.error = null;
    if (name) {
      this.name = this.cleanStr(name);
    }
  }

  createClass(Event, [{
    key: 'init',
    value: function init() {
      var _this = this;

      return this.get().then(function (html) {
        _this.process(html);
        return _this;
      });
    }
  }, {
    key: 'fetch',
    value: function fetch() {
      return Event._injected_fetch('https://www.britishcycling.org.uk/events/details/' + this.id).then(function (res) {
        return res.text();
      });
    }
  }, {
    key: 'get',
    value: function get$$1() {
      if (Event._injected_event_with_entrants_html) {
        return Promise$1.resolve(Event._injected_event_with_entrants_html);
      } else {
        return this.fetch();
      }
    }
  }, {
    key: 'process',
    value: function process(html) {
      var _this2 = this;

      var $ = Event._injected_cheerio.load(html);
      this.name = $('.article--event h1').text();
      this.races = $("table:has('.table__th--title')").first().find('.table__th--title').map(function (i, el) {
        var raceName = _this2.cleanStr($(el).text());
        var raceId = $(el).find('.load_race_entrants').attr('data-race-id');
        return new Race(raceId, raceName);
      }).toArray();
    }
  }, {
    key: 'cleanStr',
    value: function cleanStr(str) {
      return str.replace(/\s+/g, ' ').trim();
    }
  }], [{
    key: 'inject',
    value: function inject(attr, obj) {
      var privateVarName = '_injected_' + attr;
      this[privateVarName] = obj;
      Race.inject(attr, obj);
    }
  }, {
    key: 'cachePromise',
    value: function cachePromise(fnc) {
      var _this3 = this;

      var privateVarName = '_cache_var_' + fnc.name;
      if (this[privateVarName]) {
        return Promise$1.resolve(this[privateVarName]);
      }
      return fnc.call(this).then(function (result) {
        return _this3[privateVarName] = result;
      });
    }
  }, {
    key: 'upcomming',
    value: function upcomming() {
      return this.cachePromise(this._upcomming);
    }
  }, {
    key: 'getUpcomming',
    value: function getUpcomming() {
      debugger;
      if (Event._injected_events_html) {
        return Promise$1.resolve(Event._injected_events_html);
      } else {
        return Event._injected_fetch('https://www.britishcycling.org.uk/events?search_type=upcomingevents&zuv_bc_event_filter_id[]=21&resultsperpage=1000').then(function (res) {
          return res.text();
        });
      }
    }
  }, {
    key: '_upcomming',
    value: function _upcomming() {
      return this.getUpcomming(true).then(function (html) {
        var $ = Event._injected_cheerio.load(html);
        return $('.article--events__table .events--desktop__row .table__more-label a').map(function (i, node) {
          return new Event($(node).attr('data-event-id'), $(node).text());
        }).toArray();
      });
    }
  }]);
  return Event;
}();

export { Event, Race, User };
