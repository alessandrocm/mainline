'use strict';

require('./foo'); // Loads injectables
var inject = require('../../').inject;

function baz(foo, bar) {
  foo();
  console.log(bar);
}

inject(['foo', 'Bar'])(baz)();
