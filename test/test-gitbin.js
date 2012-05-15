//
// ## Test Dependencies ##
//

var app = require('../lib/gitbin')()
  , assert = require('assert')
  , t = require('./libtest')()
  , fs = require('fs')

//
// Vars & Aliases
//
var pass = true
  , fail = false
  , testfiles = ['foo.dum', 'bar.dum']
  , testbinA = __dirname + '/testbinA'
//
// ## TESTS ##
//
////////////////////////////////////////////////////////////////////
var State = {}
State.bins = t.buildData(__dirname + '/path/to/binA', '/path/to/binB')
State.trackedfiles = {}
app.setState(State)

app.run('','', function (err, state) {
  var msg = t.testmsg('prints usage on no command')
  assert.ok( (err.usrmsg) , msg(fail) ) || t.print( msg(pass) )
////////////////////////////////////////////////////////////////////
  app.run('yar!','rm *', function (err, state) {
    var msg = t.testmsg('prints usage on bad command')
    assert.ok( (err.usrmsg) , msg(fail) ) || t.print( msg(pass) )
  })
})
