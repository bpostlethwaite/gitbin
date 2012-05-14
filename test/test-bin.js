//
// ## Test Dependencies ##
//

var fglobal = __dirname + '/global.json'
  , app = require('../lib/gitbin')()
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

app.run('bin', '', function (err, data) {
  assert.ifError(err)


})

//  app.run('bin', ['-d','bina',