/*
 * dotjs - collect dotfiles and configs easily for use with git
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

  function usage () {
    var i, usage = [
      ''
      , 'dotjs - Gather scattered files into directory for use with git'
      , ''
      , 'Usage:'
      , ''
      , '      dotjs init                   - Initializes directory.'
      , '      dotjs add <file1> <filen>    - Adds n file[s] to bin.'
      , '      dotjs remove <file1> <filen> - Removes n file[s] from bin.'
      , '      dotjs bin                    - Lists initialized bins. Bin in focus is starred.'
      , '      dotjs checkout <bin>         - Switches to bin <bin>.'
      , '      dotjs push                   - Copies scattered files into bin.'
      , '      dotjs pull                   - Copies bin files into filesystem [has saftey].'
      , '      dotjs status                 - Prints bin and file status.'
      , ''
      , 'Author: Ben Postlethwaite'
    ]
    for (i = 0; i < usage.length; i += 1) {
        console.log(usage[i])
    }
  }

//
// ## MAIN CALLBACK FOR APPLICATION ##
// can be overridden for testing
//
  function cbmain (err, state) {
    if (err) {
      if (err.usage) {
        console.log(err.message)
        return usage()
      }
      else return console.log(err.message)
    }
    return
  }

//
// ## RUN ##
// Main command router
//
  that.run = function (command, args, cb) {
    if (typeof cb !== 'function') {
      cb = cbmain
    }
    my.args = args
    my.command = command

    switch (command) {
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
               'Unknown command: ' + command, printusage) )

    }
  }


////////////////////////////////////
//  ## COMMAND FUNCTIONS ##
////////////////////////////////////
//
// ## INIT COMMAND ##
//
  function init (cb ) {
    if (my.args.length > 0) {
      console.log(e.grey + 'ignoring extra arguments' + e.reset)
    }
    getState( function (err) {
      if (err) return cb(err)
      var newbin = process.cwd()
      if (my.state.bins[newbin]) {
        cb( erf( 'this directory has already been initialized' ) )
      }
      my.state.bins[newbin] = true
      writeJSON( path.join(newbin,that.flocal), '{}', function (err) {
        if (err) {
          return cb(erf('Problem writing to local state file: '
                        + e.blue + newbin + e.reset) )
        }
        writeJSON( that.fglobal, my.state.bins, function (err) {
          if (err) {
            return cb(erf('Problem writing to global state file: '
                          + e.blue + that.fglobal + e.reset) )
          }
          cb(null)
        })
      })
    }) // end getState
      

  } // end init

//
// ## ADD COMMAND ##
//
  function add (cb) {
    var files = my.args
    // Check for file arguements
    if (files.length === 0) {
      return cb( erf ('<add> command requires file arguements', true))
    }
    // Get bin and run chained processes
    getState( function (err) {
      if (err) return cb(err)  //HAS READ ERRORS
      async.asyncMap( files, processchain , function (err) {
        if (err) return cb(err)  //ERRORS FROM PROCESSING CHAIN
         writeJSON(my.state.binfile, my.state.trackedfiles, function (err) {
          if (err) {
            return cb(erf('Problem writing to local state file: '
                          + my.state.binfile) )
          }

          cb(null,my.state)
        })
      })  // end asyncMap

      function processchain (file, cb_) {
        var source = path.join(process.cwd(),file)
          , targetdir = my.state.activebin 
        async.chain(  [checkState, source, false]
                     ,[copyFile, source, targetdir]
                     ,[changeState, source, 'add']
                     ,  cb_ )
      }  //end processchain
    })  // end getState
  }  // end ADD

//
// ## BIN COMMAND ##
//
  function bin () {
    var i
    if (my.args.length > 0) {
      console.log('Don\'t need args with bin command, ignoring.')
    }
    for (i in getState()) {
      console.log( getState()[i].bin )
    }
    cb(null, null)
  }  // end commands bin


////////////////////////////////////
//  ## STATE FUNCTIONS ##
////////////////////////////////////
//
// ## GETSTATE ##
// Builds state object
//
  function getState (cb) {
    var state = {}
    state.bins = {}
    state.activebin = ""
    state.binfile = ""
    state.trackedfiles = []

    readJSON( that.fglobal, function (err, bins) {
      if (err) {
        return cb( erf('Problem reading global state file: '
                       + e.blue + that.fglobal + e.reset) )
      }
      if ( isEmpty(bins) && my.command !== 'init' ) {
        return cb( erf('Need to initialize a directory with <init>') )
      }
      state.bins = bins
      
      if ( my.command === 'init' ) {
        my.state = state
        return cb(null)
      }
      state.activebin = getActiveBin(state.bins)
      if (state.activebin) {
        state.binfile = path.join(state.activebin, that.flocal)
        stats(state.binfile, 'isFile', function (err) {
          if (err) {
            return cb( erf('Problem loading tracked file list ' + e.blue
                           + state.binfile + e.reset 
                           + '. Please re-initialize this bin directory'))
          }
          readJSON( state.binfile, function (err, files) {
            if (err) {
              return cb( erf('Problem reading local state file: '
                             + e.blue + my.state.binfile + e.reset
                             + '. Manually fix or re-initialize this bin directory' ) )
            }
            state.trackedfiles = files
            my.state = state
            cb(null)
          })  //end readJSON
        })
      }
       else return cb( erf('No active bin. There is a problem with '
                           + that.fglobal) )
     })  // end readJSON
  }  // end getState

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
// ## CHECKSTATE ##
// queries current state
// to ensure status is valid before processing
//
  function checkState ( item, inState, cb) {
    var i
    if (my.state.trackedfiles[item]) {
      if (inState) cb(null)  // Yes we found item and it's good
      else { //we found item and it's bad
        cb( erf('Item: ' + e.blue + item
                + e.reset + ' is already being tracked.') )
      }
    }
    else {
      if (inState) { // item not found and it is bad
        cb( erf('Item: ' + e.blue + item
                + e.reset + 'is not in the tracked list.') )
      }
      else cb(null) // item not found and it's good
    }
  } // end checkState

// ## CHANGESTATE ##
// Modifies the private variable my.state.
// Function allows for multiple state changes
// using a simple API
//
  function changeState ( item, type, cb) {
    var i
    switch (type) {
    case 'add':
      my.state.trackedfiles[item] = true;
      break
    case 'rm':
      console.log('functionality not available');
      break
    default:
      throw new Error('Wrong arguments for function changeState')
    }
    cb(null)
  }  // end changeState

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
      if (err) cb(err)
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
          return cb(err)
        }
      })
    })
  } // end copyFIle

//
// ## READJSON ##
//
  function readJSON (fname, cb) {
    var json
    path.exists(fname, function ( exists ) {
      if (exists) {
        fs.readFile(fname, 'utf8', function (err, data) {
          if (err || !data) return cb(err)
          try {
            json = JSON.parse(data)
          } catch (err) {
            return cb(err)
          }

          cb(null, json)
        }) //end readFile
      }
      else return cb(new Error())
    }) // end path.exists
  } // end readJSON

//
// ## WRITEJSON ##
// 
  function writeJSON (fname, data, cb) {
    var data =  JSON.stringify( data, null, 4 )
    fs.writeFile(fname, data, 'utf8', function (err) {
      if (err) return cb(err)
      cb(null)
    })
  }// end writestate

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




  return that  // Returns Application Object


}  // end commands()


