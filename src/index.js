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

export default function inject(needs, type = injectTypes.CLASS) {

  function factory() {
    return needs.map(needed => {
      let need = dependencies[needed];
      if (need) {
        if(need.type === CLASS) {
          return new need.target();
        } else if (need.type === SINGLETON) {
          return need.instance = need.instance ? need.instance : new need.target();
        }
        return need.target;
      }
    });
  }

  function getHandlers(){
    return {
      construct: function(target, overrides) {

        const injectables = factory();
        const params = mergeParameters(overrides, injectables);

        return new target(...params);
      },
      apply : function(target, thisArg, overrides) {

        const injectables = factory();
        const params = mergeParameters(overrides, injectables);

        return target(...params);
      }
    };
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

  return function decorator(target) {
    const handlers = getHandlers();
    const proxy = new Proxy(target, handlers);

    decorate(proxy, (target[meta] && target[meta].name) || target.name, {injectee:true});
    return proxy;
  };
}
