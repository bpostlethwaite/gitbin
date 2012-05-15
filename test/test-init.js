//
// ## Test Dependencies ##
//

var app = require('../lib/gitbin')()
  , assert = require('assert')
  , t = require('./libtest')()
 
//
// Aliases
//
var pass = true
  , fail = false 

//
// ## TESTS ##
//
////////////////////////////////////////////////////////////////////
var state = {}
state.bins = t.buildData('/path/to/binA', '/path/to/binB')
state.trackedfiles
app.setState(state)
app.run('init','', function (err, state) {
  assert.ifError(err)
  var msg = t.testmsg('<init> initializes directory')
  assert.ok( state.bins[ process.cwd() ], msg(fail) ) 
    || t.print( msg(pass) )
////////////////////////////////////////////////////////////////////
  var state = {}
  state.bins = t.buildData('/path/to/binA',process.cwd())
  state.trackedfiles
  app.setState(state)
  app.run('init','', function (err, state) {
    var msg = t.testmsg('<init> warns on pre-initialized directory')
    assert.equal(err.message.slice(-24), 'already been initialized'
                 , msg(fail) ) || t.print( msg(pass) )
////////////////////////////////////////////////////////////////////
  })
})