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

app.run('bin', '', function (err, state) {
  msg = t.testmsg('<bin> command returns bin list with selected active bin')
  assert.equal(err.usrmsg[0] ,'* testbinA', msg(fail) ) || t.print( msg(pass) )
  assert.equal(err.usrmsg[1] ,'  testbinB', msg(fail) )
////////////////////////////////////////////////////////////////////
  app.run('bin', ['-r',__dirname] , function (err, state) {
    msg = t.testmsg('<bin> command responds on malformed flag')
    assert.equal( err.message, 'Unknown flag: -r'
                  , msg(fail) ) || t.print( msg(pass) )
////////////////////////////////////////////////////////////////////
    app.run('bin', ['-d', 'badbin'], badBin_cb)
  })
})

function badBin_cb (err, state) {
  msg = t.testmsg('<bin> -d responds with wrong bin name')
  assert.equal( err.message.slice(-18), 'Bin not recognized'
                , msg(fail) ) || t.print( msg(pass) )
////////////////////////////////////////////////////////////////////
  app.run('bin', ['-d', 'testbinB'], removeBin_cb )
}

function removeBin_cb (err, state) {
  msg = t.testmsg('<bin> -d deletes appropriate bin')
  assert.ok( state.bins.hasOwnProperty(testbinA)
             && !state.bins.hasOwnProperty(testbinB)
             , msg(fail) ) || t.print( msg(pass) )
}
////////////////////////////////////////////////////////////////////


