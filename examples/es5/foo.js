'use strict';

var injectable = require('../../').injectable;
var injectTypes = require('../../').injectTypes;
var Mainline = require('../../').default;

function foo() {
  console.log('I am foo.');
}

function Bar() {
  this.name = 'I am bar.';
}


module.exports.foo = Mainline.registerFunc(foo);
module.exports.bar = Mainline.registerFunc(Bar);
