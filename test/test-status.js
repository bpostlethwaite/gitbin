//
// ## Test Dependencies ##
//

var app = require('../lib/gitbin')()
  , assert = require('assert')
  , testlib = require('./libtest')
  , t = testlib() 


//
// Dummy Data
//
var testbinA = __dirname + "/testbinA"
  , testbinB = __dirname + "/testbinB"
  , tfile1 = __dirname + '/flop.dum'
  , tfile2 = __dirname + '/flip.dum'


//
// Aliases
//
var pass = true
  , fail = false 

//
// ## TESTS ##
//
////////////////////////////////////////////////////////////////////
var State = {}
State.bins = t.buildData(testbinA, testbinB)
State.trackedfiles = t.buildData(tfile1,tfile2, true)
app.setState(State)
app.run('status','', function (err, state ) {
  msg = t.testmsg('<status> prints correct status')
  assert.equal( err.usrmsg[1], 'Using bin testbinA'
                , msg(fail)) || t.print( msg(pass) )
})

