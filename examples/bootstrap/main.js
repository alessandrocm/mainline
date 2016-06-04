
require('./bootstrap');

import { baz } from './dependencies2/baz';

console.log('Without parameters...');
baz();

console.log('Overriding first parameter...');
baz({name: 'This is NOT Foo.'});

console.log('Overriding second parameter...');
baz(undefined, {name: 'But this is NOT bar.'});
