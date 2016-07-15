'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.injectable = injectable;
exports.inject = inject;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var dependencies = {};

var CLASS = Symbol();
var SINGLETON = Symbol();
var FUNC = Symbol();
var VALUE = Symbol();

var meta = Symbol.for('__mainline__');

var injectTypes = exports.injectTypes = {
  CLASS: CLASS,
  SINGLETON: SINGLETON,
  FUNC: FUNC,
  VALUE: VALUE
};

function isPrimitive(target) {
  var type = typeof target === 'undefined' ? 'undefined' : _typeof(target);
  return target === null || target === undefined || type !== 'object' && type !== 'function';
}

function decorate(target, originalName, data) {
  if (!isPrimitive(target)) {
    target[meta] = target[meta] && Object.assign(target[meta], data) || Object.assign({
      name: originalName
    }, data);
  }
}

function injectable() {
  var alias = void 0,
      type = void 0,
      key = void 0;

  alias = typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'string' ? arguments.length <= 0 ? undefined : arguments[0] : undefined;
  type = _typeof(arguments.length <= 0 ? undefined : arguments[0]) === 'symbol' ? arguments.length <= 0 ? undefined : arguments[0] : (arguments.length <= 1 ? undefined : arguments[1]) || CLASS;

  return function decorator(target) {
    key = alias || target[meta] && target[meta].name || target.name;
    decorate(target, target.name, { injectable: true });
    dependencies[key] = {
      name: key,
      type: type,
      target: target
    };

    return target;
  };
}

function resolve(need, params) {
  if (need.type === CLASS) {
    return params ? new (Function.prototype.bind.apply(need.target, [null].concat(_toConsumableArray(params))))() : new need.target();
  } else if (need.type === SINGLETON) {
    return need.instance = need.instance || (params ? new (Function.prototype.bind.apply(need.target, [null].concat(_toConsumableArray(params))))() : new need.target());
  } else if (need.type === FUNC) {
    var _need$target;

    return params ? (_need$target = need.target).bind.apply(_need$target, [undefined].concat(_toConsumableArray(params))) : need.target;
  }
  return need.target;
}

function factory(needs) {
  return needs.map(function (needed) {
    var isObj = (typeof needed === 'undefined' ? 'undefined' : _typeof(needed)) === 'object';
    var key = isObj ? needed.name : needed;
    var params = isObj ? needed.using : undefined;

    var need = dependencies[key];
    if (need) {
      return resolve(need, params);
    }
  });
}

function mergeParameters(overrides, injectables) {

  var params = [];
  var diff = injectables.length - overrides.length;
  if (overrides.length) {
    overrides.forEach(function (value, index) {
      params.push(typeof value !== 'undefined' ? value : injectables[index]);
    });
  }

  if (diff > 0) {
    params.push.apply(params, _toConsumableArray(injectables.slice(overrides.length)));
  }

  return params;
}

function inject(needs) {

  function getHandlers() {
    return {
      construct: function construct(target, overrides) {

        var injectables = factory(needs);
        var params = mergeParameters(overrides, injectables);

        return new (Function.prototype.bind.apply(target, [null].concat(_toConsumableArray(params))))();
      },
      apply: function apply(target, thisArg, overrides) {

        var injectables = factory(needs);
        var params = mergeParameters(overrides, injectables);

        return target.apply(undefined, _toConsumableArray(params));
      }
    };
  }

  return function decorator(target) {
    var handlers = getHandlers();
    var proxy = new Proxy(target, handlers);

    decorate(proxy, target[meta] && target[meta].name || target.name, { injectee: true });
    return proxy;
  };
}

var Resolver = function () {
  function Resolver(need) {
    _classCallCheck(this, Resolver);

    this._need = need;
    this._overrides = null;
  }

  _createClass(Resolver, [{
    key: 'withParams',
    value: function withParams() {
      for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      this._overrides = params;
      return this;
    }
  }, {
    key: 'item',
    get: function get() {
      return this._need ? resolve(this._need, this._overrides) : undefined;
    }
  }]);

  return Resolver;
}();

var Mainline = function () {
  _createClass(Mainline, null, [{
    key: 'register',
    value: function register(target) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      injectable.apply(undefined, args)(target);
    }
  }, {
    key: 'resolve',
    value: function resolve() {
      for (var _len3 = arguments.length, needs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        needs[_key3] = arguments[_key3];
      }

      var resolutions = needs.reduce(function (accumulator, current) {
        if (dependencies[current]) {
          accumulator[current] = dependencies[current];
        }
        return accumulator;
      }, {});
      return new Mainline(resolutions);
    }
  }]);

  function Mainline(resolutions) {
    _classCallCheck(this, Mainline);

    this._resolutions = resolutions;
  }

  _createClass(Mainline, [{
    key: 'get',
    value: function get(name) {
      return new Resolver(this._resolutions[name]);
    }
  }]);

  return Mainline;
}();

exports.default = Mainline;