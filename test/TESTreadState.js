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
app.fglobal = __dirname + '/.missingfile.json'
app.flocal = '.gitbinLocal.json'
app.readState ( function (err, state) {
  var msg = t.testmsg('Informs user if global state file missing')
  assert.equal( err.message, 'Problem reading global state file: '
                +  __dirname + '/.missingfile.json', msg(fail) )
    || t.print( msg(pass) )
////////////////////////////////////////////////////////////////////
  app.fglobal = __dirname + '/.gitbinGlobal.json'
  app.flocal = '.gitbinLocal.json'
  app.readState( function (err, state) {
    assert.ifError(err)
    msg = t.testmsg('Reads state information correctly')
    assert.ok( !state.bins['path/to/bin']
               && state.bins['./testbinB']
               , msg(fail) )
    assert.ok( state.trackedfiles['./testbinB/flip.dum']
               && state.trackedfiles['./testbinB/flop.dum']
               , msg(fail) ) || t.print( msg(pass) )
  })
})