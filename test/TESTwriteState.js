//
// ## Test Dependencies ##
//

var app = require('../lib/gitbin')()
  , assert = require('assert')
  , testlib = require('./libtest')
  , t = testlib()

//
// Aliases
//
var pass = true
  , fail = false

//
// ## TESTS ##
//
////////////////////////////////////////////////////////////////////
app.fglobal = __dirname + '/.gitbinGlobal.json'
app.flocal = '.gitbinLocal.json'
var state = {}
state.bins = {
  "/path/to/bin" : false
  ,"./testbinB" : true
}

app.writeState ( state, 'testbinB/.gitbinLocal.json', function (err) {
  console.log(err)
})
