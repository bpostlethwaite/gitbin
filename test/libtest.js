//
// Helper functions
//

fs = require('fs')

module.exports = function t () {
  var that = {} 
  
  var green = '\u001b[1;32m'
  ,   grey  = '\u001b[1;30m'
  ,   red   = '\u001b[1;31m'
  ,   blue  = '\u001b[34m'
  ,   reset = '\u001b[0m'

  function print (msg, err) {
    console.log(msg) 
    if (err) console.log(err.message) 
  } 
  
  function testmsg (msg, err) {
    var that = {}
    ,   message = grey + '    ' + msg + ': ' + reset
    ,   passed = green + 'passed' + reset
    ,   failed = red + 'failed' + reset
    ,   errmsg = '' 

    if (err) errmsg = '\n' + err.message 

    that = function(pass) {
      if (pass) return message + passed  + errmsg 
      else return '\r' + message + failed + errmsg 
    } 
    
    return that 
  } 
  
  function buildData (bina, binb, flag)  {
    var that = {} 
    that[bina] = true 
    that[binb] = (flag) ? true: false 
    return that 
  }


  function cleanup (dir, files, cb) {
    fs.readdir(dir, function (err, list) {
      if (err) return cb(err) 
      list.forEach( function (foundfile) {
        files.forEach( function(rmfile) {
          if (foundfile === rmfile) {
            try {
              fs.unlinkSync(dir + '/' +  rmfile)
            } catch (e) {
              console.log('problem cleaning up' + rmfile)
            }
          }
        })
      })
      cb(null) 
    }) 
  } 
  

  
  that.print = print 
  that.testmsg = testmsg 
  that.buildData = buildData 
  that.cleanup = cleanup
  
  return that 

} 