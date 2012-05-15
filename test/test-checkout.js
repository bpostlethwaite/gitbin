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

app.run('checkout','', function (err, state) {
  msg = t.testmsg('<checkout> command prints wrong number of arg message')
  assert.equal( err.message,'"checkout" command requires single <bin> argument'
                , msg(fail) ) || t.print(msg(pass))
////////////////////////////////////////////////////////////////////
  app.run('checkout', ['testbinB'] , function (err, state) {
    msg = t.testmsg('<checkout> command switches active bin')
    assert.ok( !state.bins[testbinA] && state.bins[testbinB]
               , msg(fail) ) || t.print( msg(pass) )
////////////////////////////////////////////////////////////////////
    app.run('checkout', ['badbin'], badBin_cb)
  })
})
function badBin_cb (err, state) {
  msg = t.testmsg('<checkout> handles bad bin name')
  assert.equal( err.message, 'Can not checkout badbin. Bin not recognized'
                , msg(fail) ) || t.print( msg(pass) )
////////////////////////////////////////////////////////////////////
  var State = {}
  State.bins = {}
  State.trackedfiles = {}
  app.setState(State)
  app.run('checkout', ['testbinB'], noBins_cb)
}

function noBins_cb (err, state) {
  console.log(err)
}

