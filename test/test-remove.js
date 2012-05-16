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
var thisbin =  __dirname
  , testbinA = __dirname + "/testbinA"
  , tfile1 = __dirname + '/foo.dum'
  , tfile2 = __dirname + '/bar.dum'

//
// Aliases
//
var pass = true
  , fail = false

//
// ## TESTS ##
//
/////////////////////////////////////////////////////////////////////////////
var State = {}
State.bins = t.buildData(thisbin, testbinA)
State.trackedfiles = t.buildData(tfile1,tfile2, true)
app.setState(State)

app.run('remove', [tfile1], function (err, state) {
  assert.ifError(err)
  var msg = t.testmsg('<remove> removes file from tracked file list')
  assert.ok( !state.trackedfiles[tfile1], msg(fail) ) || t.print(msg(pass))
/////////////////////////////////////////////////////////////////////////////
  app.run('remove',['badfilename'], badfile_cb)

})

function badfile_cb(err, state) {
  if (err) {
    var msg = t.testmsg('<remove> command displays warning on bad filename')
    assert.equal( err.message.slice(-45,-1)
                  , 'is not in the tracked file list for this bin'
                  , msg(fail) ) || t.print( msg(pass) )
  }
  else assert.fail("Should have throw")
/////////////////////////////////////////////////////////////////////////////
  var State = {}
  State.bins = t.buildData(thisbin, testbinA)
  State.trackedfiles = {}
  app.setState(State)
  app.run('remove',['somefile'], nolocalfilelist_cb)
}

function nolocalfilelist_cb (err, state) {
  msg = t.testmsg('<remove> handles missing local bin tracked file list')
  assert.equal(err.message,
               "somefile is not in the tracked file list for this bin."
               , msg(fail) ) || t.print( msg(pass) )
}
/////////////////////////////////////////////////////////////////////////////







