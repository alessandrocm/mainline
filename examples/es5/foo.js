'use strict';

var injectable = require('../../').injectable;
var injectTypes = require('../../').injectTypes;

function foo() {
  console.log('I am foo.');
}

function Bar() {
  this.name = 'I am bar.';
}


module.exports.foo = injectable(injectTypes.FUNC)(foo);
module.exports.bar = injectable()(Bar);
