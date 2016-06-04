import inject, { injectTypes } from './../../../';

function bazFunc(foo, bar, moo) {
  console.log('foo: ', JSON.stringify(foo));
  console.log('bar: ', JSON.stringify(bar));
  console.log('moo: ', JSON.stringify(moo));
}

// Exports function that needs injectables
export const baz = inject(['Foo', 'Bar', 'Moo'])(bazFunc, injectTypes.FUNC);
