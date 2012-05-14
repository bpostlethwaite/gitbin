//
// ## Test Dependencies ##
//

var fglobal = __dirname + '/global.json'
  , app = require('../lib/commands')()
  , assert = require('assert')
  , fs = require('fs')
  , testlib = require('./libtest')
  , t = testlib() 

// Change this to proper config function
app.fglobal = fglobal 

//
// Dummy Data
//
var testbina =  __dirname
  , testbinb = __dirname + "/testbin_b"
  , flocal = '.trackedfiles.json'
  , tfile1 = __dirname + '/flop.dum'
  , tfile2 = __dirname + '/flip.dum'

// Write dummy data to disk
var dumglobal = t.buildData(testbina, testbinb)
var dumlocal = t.buildData(tfile1,tfile2, true)
fs.writeFileSync(fglobal, JSON.stringify(dumglobal, null, 4))
fs.writeFileSync(flocal, JSON.stringify(dumlocal, null, 4)) 

//
// Aliases
//
var pass = true
  , fail = false 

//
// ## TESTS ##
//

fs.readFile(flocal, function(err, data) {
  if (err) throw new Error('Problem reading ' + flocal + ' in init test')
  var files
  files = JSON.parse(data)  
  assert.ok( files[tfile1], "error with setup" )
  app.run('remove', [tfile1], function (err, state) {
    assert.ifError(err)
    var msg = t.testmsg('prints usage on no command') 
    fs.readFile(flocal, function(err, data) {
      if (err) throw new Error('Problem reading ' + flocal + ' in init test')
      files = JSON.parse(data)  
      var msg = t.testmsg('<remove> removes file from tracked file list')
      assert.ok( !files[tfile1], msg(fail) ) || t.print(msg(pass))
      app.run('remove',['badfilename'], badfilecb)
    })
  })
})

function badfilecb(err, state) {
  if (err) {
    var msg = t.testmsg('<remove> command displays warning on bad filename')
    assert.equal( err.message.slice(-45,-1)
                  , 'is not in the tracked file list for this bin'
                  , msg(fail) ) || t.print( msg(pass) )
  }
  else assert.fail("Should have throw")
}


