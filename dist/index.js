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
  var type = arguments.length <= 1 || arguments[1] === undefined ? injectTypes.CLASS : arguments[1];


  function factory() {
    return needs.map(function (needed) {
      var need = dependencies[needed];
      if (need) {
        if (need.type === CLASS) {
          return new need.target();
        } else if (need.type === SINGLETON) {
          return need.instance = need.instance ? need.instance : new need.target();
        }
        return need.target;
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

  return function decorator(target) {
    var proxy = null;

    function proxyFunction() {

      var injectables = factory();

      for (var _len = arguments.length, overrides = Array(_len), _key = 0; _key < _len; _key++) {
        overrides[_key] = arguments[_key];
      }

      var params = mergeParameters(overrides, injectables);

      return target.call.apply(target, [target].concat(_toConsumableArray(params)));
    }

    function ProxyClass() {

      var injectables = factory();

      for (var _len2 = arguments.length, overrides = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        overrides[_key2] = arguments[_key2];
      }

      var params = mergeParameters(overrides, injectables);

      target.call.apply(target, [this].concat(_toConsumableArray(params)));
    }

    if (type === injectTypes.CLASS) {
      ProxyClass.prototype = Object.create(target.prototype);
      proxy = ProxyClass;
    } else {
      proxy = proxyFunction;
    }

    decorate(proxy, target[meta] && target[meta].name || target.name, { injectee: true });
    return proxy;
  };
}