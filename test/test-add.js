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
var testbina =  __dirname +"/testbin_a"
  , testbinb = __dirname +"/testbin_b"
  , flocal = '.trackedfiles.json'
  , testfiles = ['foo.dum','bar.dum']
// Write Dummy Global File
var dummyData = t.buildData(testbina, testbinb) 
fs.writeFileSync(fglobal, JSON.stringify(dummyData, null, 4))
// Write Dummy Local File
fs.writeFileSync(testbina + '/' + flocal, "{}") 

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
  
  app.run('yar!','rm *', function (err, state) {
    var msg = t.testmsg('prints usage on bad command') 
    assert.ok( (err.usage && !state) , msg(fail) ) || t.print( msg(pass) ) 
    
    app.run('add',testfiles, cbstate)
  })
})  

function cbstate (err, state) {
  var msg = t.testmsg('<add> command adds files into state')     
  assert.ok( (state.trackedfiles[process.cwd() + '/' + testfiles[0]]
              && state.trackedfiles[process.cwd() + '/' + testfiles[1]]) , msg(fail) ) || 
    t.print( msg(pass) ) 

  fs.readdir(testbina, function (err, list) {
    if (err) throw new Error('Problem reading test directory') 
    var msg = t.testmsg('<add> command copies file successfully')     
    assert.ok( (list.indexOf('foo.dum') >= 0 ), msg(fail) ) || t.print( msg(pass) ) 

    
    t.cleanup(testbina, testfiles, function (err) {
      if (err) throw err 

      app.run('add','', cbNoArgs)

    }) 
  })
}

function cbNoArgs (err, state) {
  if (err) {
    var msg = t.testmsg('<add> command displays help if no args') 
    assert.equal(err.message, '<add> command requires file arguements', msg(fail) )  
      || t.print( msg(pass) )
  }  
  else assert.fail("Should have throw")
  app.run('add', ['bugs','tugs'], cbBadFileWarn)

}

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



