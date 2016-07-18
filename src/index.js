const dependencies = {};

const CLASS = Symbol();
const SINGLETON = Symbol();
const FUNC = Symbol();
const VALUE = Symbol();

const meta = Symbol.for('__mainline__');

export const injectTypes = {
  CLASS,
  SINGLETON,
  FUNC,
  VALUE
};

function isPrimitive(target) {
  const type = typeof target;
  return target === null || target === undefined || (type !== 'object' && type !== 'function');
}

function decorate(target, originalName, data) {
  if (!isPrimitive(target)) {
    target[meta] = (target[meta] && Object.assign(target[meta], data)) ||
    Object.assign({
      name: originalName
    }, data);
  }
}

export function injectable(...args) {
  let alias, type, key;

  alias = (typeof args[0] === 'string') ? args[0] : undefined;
  type = (typeof args[0] === 'symbol') ? args[0] : (args[1] || CLASS);

  return function decorator(target){
    key = alias || (target[meta] && target[meta].name) || target.name;
    decorate(target, target.name, {injectable:true});
    dependencies[key] = {
      name: key,
      type,
      target
    };

    return target;
  };
}

function resolve(need, params) {
  if(need.type === CLASS) {
    return (params) ? new need.target(...params) : new need.target();
  } else if (need.type === SINGLETON) {
    return need.instance = need.instance || (params ? new need.target(...params)
                                                    : new need.target());
  }
  else if (need.type === FUNC) {
    return (params) ? need.target.bind(undefined, ...params) : need.target;
  }
  return need.target;
}

function factory(needs) {
  return needs.map(needed => {
    const isObj = (typeof needed === 'object');
    const key = isObj ? needed.name : needed;
    const params = isObj ? needed.using : undefined;

    let need = dependencies[key];
    if (need) {
      return resolve(need, params);
    }
  });
}

function mergeParameters(overrides, injectables) {

  const params = [];
  const diff = injectables.length - overrides.length;
  if (overrides.length) {
    overrides.forEach((value, index) => {
      params.push((typeof value !== 'undefined') ? value : injectables[index]);
    });
  }

  if (diff > 0) {
    params.push(...injectables.slice(overrides.length));
  }

  return params;
}

export function inject(needs) {

  function getHandlers(){
    return {
      construct: function(target, overrides) {

        const injectables = factory(needs);
        const params = mergeParameters(overrides, injectables);

        return new target(...params);
      },
      apply : function(target, thisArg, overrides) {

        const injectables = factory(needs);
        const params = mergeParameters(overrides, injectables);

        return target(...params);
      }
    };
  }

  return function decorator(target) {
    const handlers = getHandlers();
    const proxy = new Proxy(target, handlers);

    decorate(proxy, (target[meta] && target[meta].name) || target.name, {injectee:true});
    return proxy;
  };
}

class Resolver {
  constructor(need) {
    this._need = need;
    this._overrides = null;
  }

  withParams(...params) {
    this._overrides = params;
    return this;
  }

  get item() {
    return (this._need) ? resolve(this._need, this._overrides) : undefined;
  }
}

export default class Mainline {

  static register(target, options = {}) {
    const {
      alias,
      type
    } = options;
    return injectable(alias, type)(target);
  }

  static registerFunc(target, alias) {
    return Mainline.register(target, {alias, type: injectTypes.FUNC});
  }

  static registerVariable(target, alias) {
    if (!alias) { throw new Error('Alias is required for registering variable.'); }
    return Mainline.register(target, { alias, type: injectTypes.VALUE });
  }

  static registerSingleton(target, alias) {
    return Mainline.register(target, { alias, type: injectTypes.SINGLETON });
  }

  static inject(target, needs) {
    return inject(needs)(target);
  }

  static resolve(...needs) {
    const resolutions = needs.reduce((accumulator, current) => {
      if (dependencies[current]) {
        accumulator[current] = dependencies[current];
      }
      return accumulator;
    }, {});
    return new Mainline(resolutions);
  }

  constructor(resolutions) {
    this._resolutions = resolutions;
  }

  get(name) {
    return new Resolver(this._resolutions[name]);
  }
}
