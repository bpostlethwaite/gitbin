/*
 * gitbin - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */

"use strict"

//
// ## Module Dependencies ##
//
var path = require('path')
  , fs = require('fs') 
  , async = require('./asyncs')()
  , erf = require('./erf').erf


module.exports = function app () {

  var that = {}
    , my = {} // private object for state 
    , e = erf() //for colorized error output
    , printusage = true // alias

  that.fglobal = __dirname + "/../.globalstate.json"
  that.flocal = '.trackedfiles.json'


//
// ## MAIN CALLBACK FOR APPLICATION ##
// can be overridden for testing
//
  function cbmain (err, state) {
    if (err) {
      if (err.usrmsg) {
        return print(err.usrmsg)
      }
      else return console.log(err.message)
    }
    writeState(state, function (err, status) {
      if (err) throw err
      if (status) {
        console.log('Write OK')
      }
    })
  } // end callbackmain
              

//
// ## RUN ##
// Main command router
//
  function run (command, args, cb) {
    if (typeof cb !== 'function') {
      var cb = cbmain
    }
    my.args = args
    my.command = command
    if (!my.state) {
      readState(function (err, state) {
        if (err) return cb(err)
        my.state = state
        switchboard(cb)
      })
    }
    switchboard(cb)
    
    function switchboard(cb) {
      switch (my.command) {
      case 'init':
        init(cb);
        break
      case 'add':
        add(cb);
        break
      case 'remove':
        remove(cb);
        break
      case 'bin':
        bin(cb);
        break
      default:
        cb( erf( (command === undefined) ? '' :
                 'Unknown command: ' + command , usage) )
      }
    }
  } // end RUN


////////////////////////////////////
//  ## COMMAND FUNCTIONS ##
////////////////////////////////////
//
// ###### INIT COMMAND ######
//
  function init ( cb ) {
    if (my.args.length > 0) {
      console.log(e.grey + 'ignoring extra arguments' + e.reset)
    }
    stats(process.cwd(), 'isDirectory', function (err, currentbin) {
      if (err) return cb(err)
      var newbin = currentbin.name
      if (my.state.bins.hasOwnProperty(newbin)) {
        return cb( erf( 'A bin with name ' + e.blue + path.basename(newbin) 
                        + e.reset + ' has already been initialized') )
      }
      my.state.bins = setActiveBin(my.state.bins, newbin)
      cb(null, my.state)
      
    })
  } // end init

//
// ###### ADD COMMAND ######
//
  function add (cb) {
    var files = my.args
// Check for file arguements
    if (files.length === 0) {
      return cb( erf ('<add> command requires file arguements', usage))
    }
// Get bin and run chained processes
    async.asyncMap( files, processchain , function (err) {
      if (err) return cb(err)  //ERRORS FROM PROCESSING CHAIN
      
      cb(null,my.state)
    })  // end asyncMap
    
    function processchain (file, cb_) {
      var source = path.join(process.cwd(),file)
      , targetdir = getActiveBin(my.state.bins)
      async.chain( [checkState, source, false]
                 , [copyFile, source, targetdir]
                 , [changeState, source, 'add']
                 , cb_ )
    }  //end processchain
  }  // end ADD

//
// ###### REMOVE COMMAND ######
//
  function remove (cb) {
    var files = my.args
// Check for file arguements
    if (files.length === 0) {
      return cb( erf ('<remove> command requires file arguements', usage))
    }
// Get bin and run chained processes

    async.asyncMap( files, processchain , function (err) {
      if (err) return cb(err)  //ERRORS FROM PROCESSING CHAIN
      
      cb(null, my.state)
    })  // end asyncMap

    function processchain (file, cb_) {
      var source = file
      async.chain( [checkState, source, true]
                 , [changeState, source, 'rm']
                 ,  cb_ )
    }  //end processchain
  }  // end REMOVE
               

//
// ###### BIN COMMAND ######
//
  function bin (cb) {
// Parse for flags    
    if (my.args.length === 0) {
      binlist(cb)
    }
    else {
      var flag = my.args[0]
      if (flag === '-d'
          || my.args[0] === 'delete') {
        if (my.args[1]) {
          deletebin(my.args[1],cb)
        }
        else {
          cb( erf('Must pass a bin argument to delete'))
        }
      }
      else return cb( erf('Unknown flag: ' + flag) ) 
    }
    function binlist(cb) {
      var bin, binlist = []
      for (bin in my.state.bins) {
        if (bin === getActiveBin( my.state.bins )) {
          binlist.push('* ' + path.basename(bin))
        }
        else {
          binlist.push('  ' + path.basename(bin))
        }
      }
      cb( erf('', binlist) )
    } // end binlist
    
    function deletebin(delbin, cb) {
      var bin, found = false
      for (bin in my.state.bins) {
        if (path.basename(bin) === path.basename(delbin)) {
          delete my.state.bins[bin]
          found = true
        }
      }
      if (!found) {
        return cb( erf( 'Can not remove ' + e.blue + path.basename(delbin)
                        + e.reset + '. Bin not recognized'))
      }
      cb(null, my.state)
    } // end deletebin
  } // end BIN


////////////////////////////////////
//  ## STATE MANIPULATION FUNCS ##
////////////////////////////////////
//
// ## CHECKSTATE ##
// queries current state
// to ensure status is valid before processing.
// Used in async.chain which takes a callback with single
// error argument.
  function checkState ( item, wantIt, cb) {
    var i, found = false
    if ( !(isEmpty(my.state.trackedfiles)) ) {
      for (i in my.state.trackedfiles) {
        if (path.basename(i) === path.basename(item)) {
          found = true
        }
      }
    }
    if (found && !wantIt) { 
      return cb( erf('Item: ' + e.blue + item
                     + e.reset + ' is already being tracked.') )
    }
    if (!found && wantIt) {
      return cb( erf('Item: ' + e.blue + item
                     + e.reset + ' is not in the tracked file list for this bin.') )
    }
    else cb(null) 
  } // end checkState
//  
// ## CHANGESTATE ##
// Modifies the private variable my.state.
// Used in async.chain which takes a callback with single
// error argument.

  function changeState ( item, type, cb) {
    var i
    switch (type) {
    case 'add':
      my.state.trackedfiles[item] = true;
      break
    case 'rm':
      for (i in my.state.trackedfiles) {
        if (path.basename(i) === path.basename(item)) {
          delete my.state.trackedfiles[item];
        }
      }
      break
    default:
      throw new Error('Wrong arguments for function changeState')
    }
    return cb(null)
  }  // end changeState

//
// SETSTATE
// for non-persistent in memory
// usage, such as testing.
  function setState(state) {
    my.state = state
  }

//
// ## GETACTIVEBIN ##
//
  function getActiveBin (bins) {
    var i, bin = null
    for (i in bins) {
      if (bins[i]) {
        return i
      }
      else return null
    }
  }   // end getActiveBin

//
// ## SETACTIVEBIN ##
//
  function setActiveBin (bins, activebin) {
    var i, bin = null
    for (i in bins) {
      bins[i] = false
    }
    bins[activebin] = true
    return bins
  }   // end getActiveBin


//
// ## ISEMPTY ##
// tests if object has any properties
//
  function isEmpty(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
        return false
    }

    return true
  }



////////////////////////////////////
//  ## UTILITY FUNCS
////////////////////////////////////
//
// ## STATS ##
// asyncronously checks that file is a file or a
// dir is a dir.
// Adds a mode = stats.mode property to file.
//
  function stats (fname, type, cb) {
    var file = {}
    if (!type) throw new Error('Include type in stats function')
    file.name = fname
    fs.stat(file.name, function (err, stats) {
      if (err) { 
        return cb( erf('bad path or ' + type.substring(2) + ' '
                       + e.blue + fname + e.reset))
      }
      if ( !stats[type]() ) {
        return cb ( erf(e.blue + fname + e.reset 
                        + ' not of type ' + type.substring(2)))
      }
      file.mode = stats.mode
      cb(null, file)
    })  // end fs.stat
  }  // end stats

//
// ## COPYFILE ##
// adds filename to bin path
// then creates stream objects and calls
// pump to pump the bits over.
//
  function copyFile (fname, dirname, cb) {
    stats(dirname, 'isDirectory', function (err, target) {
      if (err) return cb(err)
      stats(fname, 'isFile', function (err, file) {
        if (err) return cb(err)
        target.name = path.join(dirname, path.basename(file.name) )
        try {
          var readStream = fs.createReadStream(file.name)
          ,   writeStream = fs.createWriteStream(target.name, { mode: file.mode })
          readStream.pipe(writeStream)
          readStream.on('end', function () {
            cb(null)
          })
        } catch (err) {
          return cb(err) // Could add more info
        }
      })
    })
  } // end copyFIle

function print (msgArray) {
  for (i = 0; i < msgArray.length; i += 1) {
    console.log(usage[i])
  }
}

////////////////////////////////////
//  ## I/O FUNCTIONS ##
////////////////////////////////////
//
// ## READSTATE ##
// Builds state object
//
  function readState (cb) {
    var state = {}
    state.bins = {}
    state.trackedfiles = {}
    fs.readFile(that.fglobal, 'utf8', function (err, data) {
      if (err) {
        return cb( erf('Problem reading global state file: '
                       + e.blue + that.fglobal + e.reset) )
      }
      try {
        var bins = JSON.parse(data)
      } catch (err) {
        return cb( erf('Problem parsing global state file: '
                       + e.blue + that.fglobal + e.reset) )
      }
      if ( isEmpty(bins) && my.command !== 'init' ) {
        return cb( erf('Need to initialize a directory with <init>') )
      }
      state.bins = bins

      if ( my.command === 'init' || my.command === 'bin' ) {
        return(null, state)
      }
      
      var activebin = getActiveBin(state.bins) 
      if (activebin) {
        var localbinfile = path.join(activebin, that.flocal)
        stats(localbinfile, 'isFile', function (err) {
          if (err) {
            return cb( erf('Problem loading tracked file list ' + e.blue
                           + state.binfile + e.reset 
                           + '.\nPlease re-initialize this bin directory'
                           + ' or replace with backup.'))
          }
          fs.readFile(localbinfile, 'utf8', function (err, data) {
            if (err) {
              return cb( erf('Problem reading local state file: '
                             + e.blue + that.fglobal + e.reset) )
            }
            try {
              var tfiles = JSON.parse(data)
            } catch (err) {
              return cb( erf('Problem parsing local state file: '
                             + e.blue + that.fglobal + e.reset) )
            }
            state.trackedfiles = tfiles
            return cb(null, state)
          })  //end readJSON
        })
      }
      else return cb( erf('Please checkout a bin before issuing commands') )
    })  // end readJSON
  }  // end getState

//
// ## WriteState ##
// 
  function writeState (fname, state, cb) {
    console.log(state)
    cb(null, true)
  }

//    var data =  JSON.stringify( data, null, 4 )
//   fs.writeFile(fname, data, 'utf8', function (err) {
//      if (err) return cb(err)
//      cb(null)
//    })
//  }// end writestate

//
// ## Externally accessible funcs ##
//  
  that.run = run
  that.setState = setState
  that.readState = readState
  that.writeState = writeState

  var  usage = [
    ''
    , 'gitbin - Gather scattered files into directory bin for use with git'
    , ''
    , 'Usage:'
    , ''
    , '      gitbin init                   - Initializes directory.'
    , '      gitbin add <file1> <filen>    - Adds n file[s] to bin.'
    , '      gitbin remove <file1> <filen> - Removes n file[s] from bin.'
    , '      gitbin bin                    - Lists initialized bins. Bin in focus is starred.'
    , '      gitbin checkout <bin>         - Switches to bin <bin>.'
    , '      gitbin push                   - Copies scattered files into bin.'
    , '      gitbin pull                   - Copies bin files into filesystem [has saftey].'
    , '      gitbin status                 - Prints bin and file status.'
    , ''
    , 'Author: Ben Postlethwaite'
  ]


  return that  // Returns Application Object


}  // end commands()


