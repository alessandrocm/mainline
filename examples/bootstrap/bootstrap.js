
// Allows recursive "deep" folder require
const requireDir = require('require-dir');

// Requiring the files makes injectables available
// to all subsequent files.
requireDir('./dependencies1', { recurse: true });
