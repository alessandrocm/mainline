import inject, {injectable, injectTypes} from '../';
import {assert} from 'chai';

describe('#injectable', () => {
  it('should return a function', done => {
    const decorator = injectable();
    assert.isFunction(decorator);
    done();
  });

  it('decorator should return the target', done => {
    const expected = () => true;
    const decorator = injectable();
    const actual = decorator(expected);
    assert.equal(expected, actual);
    done();
  });

  it('decorator should decorate non-primitive targets', done => {
    const expected = { name: 'target', injectable: true };
    const property = Symbol.for('__mainline__');
    const decorator = injectable();
    function target() { return false; }
    decorator(target);
    assert.deepEqual(expected, target[property]);
    done();
  });
});

describe('#inject', () => {
  it('should return a function', done => {
    const decorator = inject();
    assert.isFunction(decorator);
    done();
  });

  it('decorator should decorate target', done => {
    const expected = { name: 'target', injectee: true };
    const property = Symbol.for('__mainline__');
    const decorator = inject(['needs']);
    function target() { return true; }
    const actual = decorator(target);
    assert.deepEqual(expected, actual[property]);
    done();
  });

  it('decorator should return constructor for instance of target', done => {
    const decorator = inject(['Object']);
    class Actual { constructor(arg1) { this.arg1 = arg1; }}
    const Proxy = decorator(Actual);
    assert.instanceOf(new Proxy(), Actual);
    done();
  });

  it('decorator should inject correct types', done => {
    @injectable()
    class Expected {}

    injectable('expecting', injectTypes.FUNC)(function expected() { return true; });
    injectable('expect', injectTypes.VALUE)(100);

    @inject(['Expected', 'expecting', 'expect'])
    class Actual {
      constructor(expect1, expect2, expect3) {
        this.expecting = { expect1, expect2, expect3 };
      }
    }

    const actuals = (new Actual()).expecting;
    assert.instanceOf(actuals.expect1, Expected);
    assert.typeOf(actuals.expect2, 'function');
    assert.typeOf(actuals.expect3, 'number');
    done();
  });

  it('decorator should always inject same instance of singletons', done => {
    @injectable(injectTypes.SINGLETON)
    class Singleton { // eslint-disable-line no-unused-vars
      constructor() {
        this.number = Math.random();
      }
    }
    let singleton1, singleton2;
    inject(['Singleton'])(
    function injectee1(param1) {
      singleton1 = param1;
    })();

    inject(['Singleton'])(
    function injectee2(param2) {
      singleton2 = param2;
    })();

    assert.deepEqual(singleton1, singleton2);
    done();
  });

  it('decorator should inject into function', done => {
    @injectable()
    class Dependency {}

    let actual1 = null;
    const injectee = inject(['Dependency'], injectTypes.FUNC)(
      function(param) {
        actual1 = param;
      }
    );

    injectee();
    assert.instanceOf(actual1, Dependency);
    injectee({});
    assert.notInstanceOf(actual1, Dependency);
    done();
  });

  it('decorator should allow for parameter overrides', done => {
    @injectable()
    class InjectableClass {
      constructor(name = 'Jim') { this.name = name; }
    }

    @inject(['InjectableClass','InjectableClass'])
    class Injectee {
      constructor(param1, param2) { this.param1 = param1; this.param2 = param2; }
    }

    const override = new InjectableClass('Tim');
    const instance1 = new Injectee();
    const instance2 = new Injectee(override);

    assert.notEqual(instance1.param1.name, instance2.param1.name);
    assert.equal(instance1.param2.name, instance2.param2.name);
    done();
  });

  it('should allow for specifying parameters for dependencies', done => {
    @injectable()
    class InjectableThing {
      constructor(param) { this.value = param; }
    }

    @inject([{name:'InjectableThing', using:[true]}])
    class TargetClass {
      constructor(thing) { this.dep = thing; }
    }

    const instance = new TargetClass();

    assert.instanceOf(instance.dep, InjectableThing);
    assert.isTrue(instance.dep.value);
    done();
  });
});
