const dependencies = {};

const CLASS = Symbol();
const SINGLETON = Symbol();
const FUNC = Symbol();
const VALUE = Symbol();

export const injectTypes = {
  CLASS,
  SINGLETON,
  FUNC,
  VALUE
};

export function injectable(...args) {
  let alias, type;

  alias = (typeof args[0] === 'string') ? args[0] : undefined;
  type = (typeof args[0] === 'symbol') ? args[0] : (args[1] || CLASS);

  return function decorator(target){
    dependencies[alias || target.name] = {
      name: alias || target.name,
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

    function proxyFunction(...overrides) {

      const injectables = factory();
      const params = mergeParameters(overrides, injectables);

      return target.call(target,...params);
    }

    function ProxyClass(...overrides) {

      const injectables = factory();
      const params = mergeParameters(overrides, injectables);

      target.call(this,...params);
    }

    if (type === injectTypes.CLASS){
      ProxyClass.prototype = Object.create(target.prototype);
      return ProxyClass;
    }

    return proxyFunction;
  };
}
