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
  , tfileA = __dirname + '/foo.dum'
  , tfileB = __dirname + '/bar.dum'
  , testbinA = __dirname + '/testbinA'
  , testbinB = __dirname + '/testbinB'
//
// ## TESTS ##
//
////////////////////////////////////////////////////////////////////
var State = {}
State.bins = t.buildData(testbinA, testbinB)
State.trackedfiles = t.buildData(tfileA, tfileB, true)
app.setState(State)

app.run('push', '', function (err, state) {
  msg = t.testmsg('<push> command shows file by file info')
  assert.ok( (err.usrmsg[0] === 'Pushed foo.dum')
             && (err.usrmsg[1] === 'Pushed bar.dum')
             , msg(fail) ) || t.print( msg(pass) )
////////////////////////////////////////////////////////////////////

  fs.readdir(testbinA, function (err, list) {
    if (err) throw new Error('Problem reading test directory')
    var msg = t.testmsg('<push> command pushes files successfully')
    assert.ok( (list.indexOf('foo.dum') >= 0 ), msg(fail) )
    assert.ok( (list.indexOf('bar.dum') >= 0 ), msg(fail) ) || t.print( msg(pass) )
    t.cleanup(testbinA,  badpush_cb)
  })
})
////////////////////////////////////////////////////////////////////

function badpush_cb ( err ) {
  if (err) throw err
  var State = {}
  State.bins = t.buildData(testbinA, testbinB)
  State.trackedfiles = t.buildData(tfileA, __dirname + '/badfile', true)
  app.setState(State)
  app.run('push', '', function (err, state) {
    msg = t.testmsg('<push> prints correct file by file info on bad single bad file')
    assert.ok( (err.usrmsg[0].slice(0,16) === 'bad path or File')
               && (err.usrmsg[1] === 'Pushed foo.dum')
               , msg(fail) ) || t.print( msg(pass) )
////////////////////////////////////////////////////////////////////

    fs.readdir(testbinA, function (err, list) {
      if (err) throw new Error('Problem reading test directory')
      var msg = t.testmsg('<push> command deals with bad filepath successfully')
      assert.ok( (list.indexOf('foo.dum') >= 0 ), msg(fail) )
      assert.ok( (list.indexOf('bar.dum') === -1 ), msg(fail) ) || t.print( msg(pass) )
      t.cleanup(testbinA, function (err) {
        if (err) throw err
      })
    })
  })
}
