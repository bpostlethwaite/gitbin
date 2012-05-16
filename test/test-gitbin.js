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
  app.run('yar!','rm *', badcommand_cb)
})

function badcommand_cb(err, state) {
  msg = t.testmsg('prints usage on bad command')
  assert.ok( (err.usrmsg) , msg(fail) ) || t.print( msg(pass) )
////////////////////////////////////////////////////////////////////
  var State = {}
  State.bins = {}
  State.trackedfiles = {}
  app.setState(State)
  app.run('','', nostatefile_cb)
}

function nostatefile_cb (err, state) {
  msg = t.testmsg("Handles missing global state file")
  assert.equal(err.message, "Please initialize a bin before continuing"
               , msg(fail) ) || t.print( msg(pass) )
}
////////////////////////////////////////////////////////////////////

