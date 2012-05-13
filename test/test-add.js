//
// ## Test Dependencies ##
//

var globalfile = __dirname + '/global.json'
  , app = require('../lib/commands')()
  , assert = require('assert')
  , fs = require('fs')
  , testlib = require('./libtest')
  , t = testlib() 

// Change this to proper config function
app.fglobal = globalfile 

//
// Dummy Data
//
var testbina =  __dirname +"/testbin_a"
  , testbinb = __dirname +"/testbin_b"


// Write Dummy Global File
var dummyData = t.buildData(testbina, testbinb) 
fs.writeFile(globalfile, JSON.stringify(dummyData, null, 4), function (err) {
  if (err) throw err 
}) 
// Write Dummy Local File
fs.writeFile(testbina + '/.trackedfiles.json', "{}", function (err) {
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

//
// ## No command test
//
app.run('','', function (err, state) {
  var msg = t.testmsg('prints usage on no command') 
  assert.ok( (err.usage && !state) , msg(fail) ) || t.print( msg(pass) ) 
})  

//
// ## Bad command test
//  
app.run('yar!','rm *', function (err, state) {
  var msg = t.testmsg('prints usage on bad command') 
  assert.ok( (err.usage && !state) , msg(fail) ) || t.print( msg(pass) ) 
}) 


//
// ## <add> command tests ##
// Functionality
var testfiles = ['test/foo.dum','test/bar.dum']
app.run('add',testfiles, function (err, state) {        

  var msg = t.testmsg('<add> command adds files into state')     
  assert.ok( (state.trackedfiles[process.cwd() + '/' + testfiles[0]]
              && state.trackedfiles[process.cwd() + '/' + testfiles[1]]) , msg(fail) ) || 
    t.print( msg(pass) ) 

  fs.readdir(testbina, function (err, list) {
    if (err) throw new Error('Problem reading test directory') 
    var msg = t.testmsg('<add> command copies file successfully')     
    assert.ok( (list.indexOf('foo.dum') >= 0 ), msg(fail) ) || t.print( msg(pass) ) 
    
    cleanup(testbina, function (err) {
      if (err) throw err 
    }) 
  }) 
}) 


//
// ## <add> command test ##
// Error Handling

app.run('add','', function (err, state) {
  if (err) {
    var msg = t.testmsg('<add> command displays help if no args') 
    assert.equal(err.message, '<add> command requires file arguements', msg(fail) )  
      || t.print( msg(pass) )
  }  
    else assert.fail("Should have throw")
})


app.run('add', ['bugs'], function (err, state) {
  if (err) {
    var msg = t.testmsg('<add> provides warning on bad file argument') 
    assert.equal(err.message.substring(0,16), 'bad path or File', msg(fail) ) 
      || t.print( msg(pass) )
  }
  else assert.fail("Should have throw") 
})


//
// After (Cleanup) -> Remove files from testbin_a
//
var dir = 'test/testbin_a' 
function cleanup (dir, cb) {
    fs.readdir(dir, function (err, list) {
        if (err) return cb(err) 
        list.forEach( function (file) {
            if (file === "foo.dum") {
                fs.unlinkSync('test/testbin_a/foo.dum')  
            }
            else if (file === "bar.dum") {
                fs.unlinkSync('test/testbin_a/bar.dum') 
            }
        }) 
        cb(null) 
    }) 
} 

