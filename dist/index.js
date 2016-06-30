'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.injectable = injectable;
exports.default = inject;

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

function inject(needs) {

  function factory() {
    return needs.map(function (needed) {
      var isObj = (typeof needed === 'undefined' ? 'undefined' : _typeof(needed)) === 'object';
      var key = isObj ? needed.name : needed;
      var params = isObj ? needed.using : undefined;

      var need = dependencies[key];
      if (need) {
        if (need.type === CLASS) {
          return params ? new (Function.prototype.bind.apply(need.target, [null].concat(_toConsumableArray(params))))() : new need.target();
        } else if (need.type === SINGLETON) {
          return need.instance = need.instance ? need.instance : params ? new (Function.prototype.bind.apply(need.target, [null].concat(_toConsumableArray(params))))() : new need.target();
        } else if (need.type === FUNC) {
          var _need$target;

          return params ? (_need$target = need.target).bind.apply(_need$target, [undefined].concat(_toConsumableArray(params))) : need.target;
        }
        return need.target;
      }
    });
  }

  function getHandlers() {
    return {
      construct: function construct(target, overrides) {

        var injectables = factory();
        var params = mergeParameters(overrides, injectables);

        return new (Function.prototype.bind.apply(target, [null].concat(_toConsumableArray(params))))();
      },
      apply: function apply(target, thisArg, overrides) {

        var injectables = factory();
        var params = mergeParameters(overrides, injectables);

        return target.apply(undefined, _toConsumableArray(params));
      }
    };
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

  return function decorator(target) {
    var handlers = getHandlers();
    var proxy = new Proxy(target, handlers);

    decorate(proxy, target[meta] && target[meta].name || target.name, { injectee: true });
    return proxy;
  };
}