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
var testbina = __dirname + "/testbin_a"
  , testbinb = __dirname + "/testbin_b"
  , flocal = '.trackedfiles.json'

// Write Dummy Global File
var dummyData = t.buildData(testbina, testbinb) 
fs.writeFileSync(fglobal, JSON.stringify(dummyData, null, 4)) 
t.cleanup(process.cwd(), [flocal] , function (err) {
  if (err) throw err
})

//
// Aliases
//
var pass = true
  , fail = false 

//
// ## TESTS ##
//
app.run('init','', function (err, state) {
  assert.ifError(err) 
  fs.readdir(process.cwd(), function (err, list) {
    if (err) throw new Error('Problem reading test directory')
    var msg = t.testmsg('<init> command adds ' + flocal 
                        + ' into bin directory')
    assert.ok( (list.indexOf(flocal) >= 0), msg(fail) ) || t.print( msg(pass) )
    fs.readFile(fglobal, function(err, data) {
      var bins, count = 0
      if (err) throw new Error('Problem reading ' + flocal + ' in init test')
      bins = JSON.parse(data)
      var msg = t.testmsg('<init> sets newly initialized bin as active')
      assert.ok( ( bins[process.cwd()] ) , msg(fail) ) 
        || t.print( msg(pass) )
      var msg = t.testmsg(
        '<init> deactivates previously active bins on initialization')
      for (i in bins) {
        if (bins[i]) {
          count += 1
        }
      }
      assert.deepEqual(count, 1, msg(fail)) || t.print( msg(pass) )
      
      var msg = t.testmsg('<init> warns on pre-initialized directory')
      app.run('init','', function (err, state) {
        assert.equal(err.message, 'This directory has already been initialized'
                     , msg(fail) ) || t.print( msg(pass) )
      })
    })
  })
})
//
