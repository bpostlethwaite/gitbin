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
  , testbinB = __dirname + '/testbinB'
//
// ## TESTS ##
//
////////////////////////////////////////////////////////////////////
var State = {}
State.bins = t.buildData( testbinA, testbinB)
State.trackedfiles = {}
app.setState(State)
app.run('add', testfiles, function (err, state) {
  assert.ifError(err)
  var msg = t.testmsg('<add> command adds files into state')
  assert.ok( (state.trackedfiles[process.cwd() + '/' + testfiles[0]]
              && state.trackedfiles[process.cwd() + '/' + testfiles[1]]) , msg(fail) ) ||
    t.print( msg(pass) )
////////////////////////////////////////////////////////////////////
  fs.readdir(testbinA, function (err, list) {
    if (err) throw new Error('Problem reading test directory')
    var msg = t.testmsg('<add> command copies file successfully')
    assert.ok( (list.indexOf('foo.dum') >= 0 ), msg(fail) ) || t.print( msg(pass) )
    t.cleanup(testbinA, function (err) {
      if (err) throw err
////////////////////////////////////////////////////////////////////
      app.run('add','', cbNoArgs)
    })
  })
})
function cbNoArgs (err, state) {
  if (err) {
    var msg = t.testmsg('<add> command displays help if no args')
    assert.equal(err.message, '<add> command requires file arguements', msg(fail) )
      || t.print( msg(pass) )
  }
  else assert.fail("Should have throw")
  app.run('add', ['bugs','tugs'], cbBadFileWarn)

}
////////////////////////////////////////////////////////////////////
function cbBadFileWarn (err, state){
  if (err) {
    var msg = t.testmsg('<add> provides warning on bad file argument')
    assert.equal(err.message.substring(0,16), 'bad path or File', msg(fail) )
      || t.print( msg(pass) )
  }
  else {
    console.log(state)
    assert.fail("Should have throw")
  }
}



