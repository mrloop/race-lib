'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Promise$1 = require('es6-promise');
var uriJs = require('uri-js');
var serialFetch = require('serial-fetch');
var AbortControllerImpl = require('abort-controller');
var eventTargetShim = require('event-target-shim');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Promise__default = /*#__PURE__*/_interopDefaultLegacy(Promise$1);
var serialFetch__default = /*#__PURE__*/_interopDefaultLegacy(serialFetch);
var AbortControllerImpl__default = /*#__PURE__*/_interopDefaultLegacy(AbortControllerImpl);

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function delayFetch(originalFetch, delay) {
  return function fetch(input, init) {
    return new Promise(function (resolve, reject) {
      //bit of work around for delayed serialized requests and abort.
      //manually check in signal.abort has been called as fetch wouldn't have existed when first called
      if (init.signal && init.signal.aborted) {
        reject({
          name: 'AbortError'
        });
      } else {
        setTimeout(function () {
          originalFetch(input, init).then(resolve).catch(reject);
        }, delay);
      }
    });
  };
}

var DEFAULT_NUM = 999;

var User = /*#__PURE__*/function () {
  function User(href, name, signal) {
    _classCallCheck(this, User);

    this.id = this.idFromUrl(href); //3; //new URI(href).search(true).person_id;

    this.name = name || '';
    this.signal = signal;
    this.points_href = href;
    this.points_loaded = false;
    this.pointsPromise = this.initPoints();
    this.regional_rank = DEFAULT_NUM;
    this.national_rank = DEFAULT_NUM;
  }

  _createClass(User, [{
    key: "idFromUrl",
    value: function idFromUrl(url) {
      return uriJs.parse(url).query.split('&').find(function (kv) {
        return kv.split('=')[0] === 'person_id';
      }).split('=')[1];
    }
  }, {
    key: "fetchPoints",
    value: function fetchPoints() {
      var _this = this;

      return User._injected_fetch("https://www.britishcycling.org.uk/".concat(this.points_href), {
        signal: this.signal
      }).then(function (res) {
        if (res.status >= 400) {
          _this.error = res.statusText;
          throw res.statusText;
        }

        return res.text();
      });
    }
  }, {
    key: "getPoints",
    value: function getPoints() {
      if (User._injected_person_html) {
        return Promise__default['default'].resolve(User._injected_person_html);
      } else {
        return this.fetchPoints();
      }
    }
  }, {
    key: "initPoints",
    value: function initPoints() {
      var _this2 = this;

      return this.getPoints().then(function (body) {
        _this2.points_loaded = true;

        var $ = User._injected_cheerio.load(body);

        $('dd').each(function (i, el) {
          _this2.parseDd($(el).text());
        });

        if ($('main h1').text().split(':')[1]) {
          _this2.name = _this2.name || $('main h1').text().split(':')[1].trim();
        }

        return _this2;
      });
    }
  }, {
    key: "parseDd",
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
          if (User._fakeRank) {
            this.regional_rank = _toConsumableArray(this.name).reduce(function (a, c) {
              return a + c.charCodeAt();
            }, 0);
          } else {
            this.regional_rank = Number(arr[1]) || DEFAULT_NUM;
          }

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
    key: "compareFnc",
    value: function compareFnc(a, b) {
      if (a.national_rank !== DEFAULT_NUM || b.national_rank !== DEFAULT_NUM) {
        return a.national_rank - b.national_rank;
      } else if (a.regional_rank !== DEFAULT_NUM || b.regional_rank !== DEFAULT_NUM) {
        return a.regional_rank - b.regional_rank;
      } else {
        return a.name.localeCompare(b.name);
      }
    }
  }, {
    key: "sort",
    value: function sort(users) {
      return users.sort(this.compareFnc);
    }
  }, {
    key: "inject",
    value: function inject(attr, obj) {
      var privateVarName = "_injected_".concat(attr);
      this._fakeRank = true;

      if (attr === 'fetch') {
        if (typeof serialFetch__default['default'] === 'function') {
          obj = serialFetch__default['default'](delayFetch(obj, 4000));
        } else {
          // shouldn't be necessary - issue with rollup?
          obj = serialFetch__default['default'].default(delayFetch(obj, 4000));
        }
      }

      this[privateVarName] = obj;
    }
  }]);

  return User;
}();

var Race = /*#__PURE__*/function (_EventTarget) {
  _inherits(Race, _EventTarget);

  var _super = _createSuper(Race);

  function Race(id, name) {
    var _this;

    _classCallCheck(this, Race);

    _this = _super.call(this);
    _this.name = name;
    _this.id = id;
    return _this;
  }

  _createClass(Race, [{
    key: "toString",
    value: function toString() {
      return "{ id: ".concat(this.id, ", name: ").concat(this.name, " }");
    }
  }, {
    key: "fetchEntrants",
    value: function fetchEntrants() {
      return Race._injected_fetch("https://www.britishcycling.org.uk/events_version_2/ajax_race_entrants_dialog?race_id=".concat(this.id)).then(function (res) {
        return res.text();
      });
    }
  }, {
    key: "getEntrants",
    value: function getEntrants(race_id) {
      if (Race._injected_entrants_html) {
        return Promise__default['default'].resolve(Race._injected_entrants_html);
      } else {
        return this.fetchEntrants(race_id);
      }
    }
  }, {
    key: "processEntrants",
    value: function processEntrants(html, signal) {
      var $ = Race._injected_cheerio.load(html);

      return $("table[summary='List of entrants in this race'] tbody tr").map(function (i, el) {
        var link = $(el).find('a').first();
        return {
          href: link.attr('href'),
          name: link.text().trim()
        };
      }).filter(function (i, el) {
        return !!el.href;
      }).map(function (i, details) {
        return new User(details.href, details.name, signal);
      });
    }
  }, {
    key: "initEntrants",
    value: function initEntrants(signal) {
      var _this2 = this;

      return this.getEntrants(this.id).then(function (html) {
        return _this2.processEntrants(html, signal);
      }).then(function (users) {
        return _this2._users = users.toArray();
      });
    } // return users promise without waiting for users points promises to resolve
    // for more response UI. Use this in favour of `entrants`. Keeping `entrants` for use
    // in race-ext glimmerjs app, could be removed if race-ext glimmerjs app updated

  }, {
    key: "users",
    value: function users() {
      if (this._usersPromise) {
        return this._usersPromise;
      }

      return this._usersPromise = this.initEntrants();
    }
  }, {
    key: "entrants",
    value: function entrants() {
      var _this3 = this;

      if (this._users) {
        return Promise__default['default'].resolve(this._users);
      }

      if (this._allPromise) {
        return this._allPromise;
      }

      var abortController = new AbortControllerImpl__default['default']();

      if (typeof AbortController !== "undefined") {
        abortController = new AbortController();
      }

      var signal = abortController.signal;
      this._allPromise = this.initEntrants(signal).then(function (entrants) {
        _this3.setupNotifications(entrants); //want point promises to settle


        return Promise__default['default'].all(entrants.map(function (entrant) {
          return entrant.pointsPromise;
        })).then(function () {
          return _this3._users = User.sort(_this3._users);
        }).catch(function (err) {
          abortController.abort(); //cancels all other fetches

          throw {
            message: err,
            users: _this3._users
          };
        });
      });
      return this._allPromise;
    }
  }, {
    key: "setupNotifications",
    value: function setupNotifications(entrants) {
      var _this4 = this;

      var count = 0;
      this.dispatchEvent({
        type: 'entrantLoaded',
        detail: {
          users: this._users,
          loaded: count,
          total: entrants.length
        }
      });
      entrants.forEach(function (entrant) {
        entrant.pointsPromise.then(function () {
          count = count + 1;

          _this4.dispatchEvent({
            type: 'entrantLoaded',
            detail: {
              users: User.sort(_this4._users),
              loaded: count,
              total: entrants.length
            }
          });
        }).catch(function (err) {
          _this4.dispatchEvent({
            type: 'entrantError',
            detail: {
              user: entrant,
              error: err
            }
          });
        });
      });
    }
  }], [{
    key: "inject",
    value: function inject(attr, obj) {
      var privateVarName = "_injected_".concat(attr);
      this[privateVarName] = obj;
      User.inject(attr, obj);
    }
  }]);

  return Race;
}(eventTargetShim.EventTarget);
eventTargetShim.defineEventAttribute(Race.prototype, "entrantLoaded");
eventTargetShim.defineEventAttribute(Race.prototype, "entrantError");

var Event = /*#__PURE__*/function () {
  function Event(id, name) {
    _classCallCheck(this, Event);

    this.id = id;
    this.races = [];
    this.error = null;

    if (name) {
      this.name = this.cleanStr(name);
    }
  }

  _createClass(Event, [{
    key: "init",
    value: function init() {
      var _this = this;

      return this.get().then(function (html) {
        _this.process(html);

        return _this;
      });
    }
  }, {
    key: "fetch",
    value: function fetch() {
      return Event._injected_fetch("https://www.britishcycling.org.uk/events/details/".concat(this.id)).then(function (res) {
        return res.text();
      });
    }
  }, {
    key: "get",
    value: function get() {
      if (Event._injected_event_with_entrants_html) {
        return Promise__default['default'].resolve(Event._injected_event_with_entrants_html);
      } else {
        return this.fetch();
      }
    }
  }, {
    key: "process",
    value: function process(html) {
      var _this2 = this;

      var $ = Event._injected_cheerio.load(html);

      this.name = $('.article--event h1').text();
      this.races = $("table:has(.table__th--title)").first().find('.table__th--title').map(function (i, el) {
        var raceName = _this2.cleanName($(el).text());

        var raceId = $(el).find('.load_race_entrants').attr('data-race-id');
        return new Race(raceId, raceName);
      }).toArray();
    }
  }, {
    key: "cleanName",
    value: function cleanName(str) {
      return this.cleanStr(str.replace(/View Entrants/g, ''));
    }
  }, {
    key: "cleanStr",
    value: function cleanStr(str) {
      return str.replace(/\s+/g, ' ').trim();
    }
  }], [{
    key: "inject",
    value: function inject(attr, obj) {
      var privateVarName = "_injected_".concat(attr);
      this[privateVarName] = obj;
      Race.inject(attr, obj);
    }
  }, {
    key: "cachePromise",
    value: function cachePromise(fnc) {
      var _this3 = this;

      var privateVarName = "_cache_var_".concat(fnc.name);

      if (this[privateVarName]) {
        return Promise__default['default'].resolve(this[privateVarName]);
      }

      return fnc.call(this).then(function (result) {
        return _this3[privateVarName] = result;
      });
    }
  }, {
    key: "upcomming",
    value: function upcomming() {
      return this.cachePromise(this._upcomming);
    }
  }, {
    key: "getUpcomming",
    value: function getUpcomming() {
      if (Event._injected_events_html) {
        return Promise__default['default'].resolve(Event._injected_events_html);
      } else {
        return Event._injected_fetch('https://www.britishcycling.org.uk/events?search_type=upcomingevents&zuv_bc_event_filter_id[]=21&resultsperpage=1000').then(function (res) {
          return res.text();
        });
      }
    }
  }, {
    key: "_upcomming",
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

exports.Event = Event;
exports.Race = Race;
exports.User = User;
