import inject, {injectable} from '../';
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

  it('decorator should decorate target', done => {
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
});
