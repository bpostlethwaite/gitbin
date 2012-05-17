/*
 * gitbin - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */

"use strict"
var path = require('path')
  , fs = require('fs')
  , rl = require('readline')
  , async = require('./asyncs')()
  , erf = require('./erf').erf



module.exports = function app () {


  var that = {}
    , my = {} // private object for state

  that.fglobal = process.env.HOME + "/.gitbinGlobal.json"
  that.flocal = '.gitbinLocal.json'


  ////////////////////////////////////
  // ## MAIN CALLBACK  ##
  // can be overridden for testing
  ////////////////////////////////////
  function cbmain (err, state) {
    var localfile = null
    if (err) {
      if (err.usrmsg) {
        print(err.usrmsg)
        return
      }
      else {
        console.log(err.message)
        return
      }
    }
    if (!isEmpty(state.bins)) {
      localfile = path.join(getActiveBin(state.bins), that.flocal)
    }
    writeState(state, localfile, function (err, status) {
      if (err) throw err

    })
  } // end callbackmain


  ////////////////////////////////////
  // ## RUN ##
  // Main command router
  ////////////////////////////////////
  function run (command, args, cb) {
    if (typeof cb !== 'function') {
      var cb = cbmain
    }
    my.args = args
    my.command = command
    if (my.state) {
      parseState( function (err) {
        if (err) return cb(err)
        switchboard(cb)
      })
    }
    else {
      readState(function (err, state) {
        if (err) return cb(err)
        setState(state)
        parseState( function (err) {
          if (err) return cb(err)
          switchboard(cb)
        }) //end parseState
      }) // end readState
    }

    function switchboard(cb) {
      switch (my.command) {
      case 'init':
        init(cb);
        break
      case 'add':
        add(cb)
        break
      case 'remove':
        remove(cb);
        break
      case 'bin':
        bin(cb);
        break
      case 'checkout':
        checkout(cb);
        break
      case 'status':
        status(cb);
        break
      case 'push':
        push(cb);
        break
      default:
        cb( erf( (command === undefined) ? '' :
                 'Unknown command: ' + command , usage) )
      }
    } // end SWITCHBOARD
  } // end RUN


  ////////////////////////////////////
  //  ## COMMAND FUNCTIONS ##
  ////////////////////////////////////
  //
  // ###### INIT COMMAND ######
  //
  function init ( cb ) {
    if (my.args.length > 0) {
      console.log('ignoring extra arguments')
    }
    stats(process.cwd(), 'isDirectory', function (err, currentbin) {
      if (err) return cb(err)
      var newbin = currentbin.name
      if (my.state.bins.hasOwnProperty(newbin)) {
        return cb( erf( 'A bin with name ' + path.basename(newbin)
                        + ' has already been initialized') )
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
        return cb( erf( 'Can not remove ' + path.basename(delbin)
                        +  '. Bin not recognized'))
      }
      cb(null, my.state)
    } // end deletebin
  } // end BIN

  //
  // ###### CHECKOUT ######
  //
  function checkout (cb) {
    if (my.args.length !== 1) {
      return cb( erf( '"checkout" command requires single <bin> argument' ) )
    }
    var bin
    , found = false
    , chbin = my.args[0]

    for (bin in my.state.bins) {
      if (path.basename(bin) === path.basename(chbin)) {
        my.state.bins = setActiveBin(my.state.bins, bin)
        found = true
      }
    }
    if (!found) {
      return cb( erf( 'Can not checkout ' +  path.basename(chbin)
                      + '. Bin not recognized'))
    }
    cb(null, my.state)
  } // end BIN

  //
  // ###### PUSH COMMAND ######
  //
  function push (cb) {
    if (my.args.length > 0) {
      console.log( 'ignoring extra arguments' )
    }
    var i, l
    , dmsgs = []
    , flist = []
    , bin = getActiveBin(my.state.bins)
    for (i in my.state.trackedfiles) {
      flist.push(i)
    }
    l = flist.length
    if (!l) return cb( erf ('Cannot push, no files are being tracked') )
    function cb_ (er , cpfile) {
      if (er) dmsgs.push(er.message)
      if (cpfile) dmsgs.push('Pushed ' + path.basename(cpfile))
      if (-- l === 0) cb( erf('', dmsgs) )
    }
    flist.forEach(function (file) {
      copyFile (file, bin, cb_)
    })
  } // end PUSH

  //
  // ###### PULL COMMAND ######
  //

  //
  // ###### FETCH COMMAND ######
  //

  //
  // ###### STATUS COMMAND ######
  //
  function status (cb) {
    var i, m1, filearray = []
    if (my.args.length > 0) {
      console.log('ignoring extra arguments')
    }
    for (i in my.state.trackedfiles) {
      filearray.push( path.basename(i) )
    }
    m1 = [
      , 'Using bin ' + path.basename(getActiveBin(my.state.bins))
      , 'Currently tracked files: '
      , ''
    ]
    return cb( erf('', m1.concat(filearray) ))
  } // end STATUS


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
      return cb( erf(path.basename(item) + ' is already being tracked.') )
    }
    if (!found && wantIt) {
      return cb( erf(path.basename(item)
                     + ' is not in the tracked file list for this bin.') )
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
          delete my.state.trackedfiles[i];
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
  // ## PARSESTATE
  // Checks that bins have been initialized
  // or active bins are present, and depending
  // on the command routes messages.
  function parseState (cb) {
    if (my.command === 'init') return cb(null)
    if ( isEmpty(my.state.bins) ) {
      return cb( erf('Please initialize a bin before continuing') )
    }
    if ( !getActiveBin(my.state.bins)
         && (my.command !== 'checkout') ) {
      return cb( erf("Please use 'checkout' <bin> command to activate a bin") )
    }
    cb(null)
  }


  //
  // ## GETACTIVEBIN ##
  //
  function getActiveBin (bins) {
    var i
    for (i in bins) {
      if (bins[i]) {
        return i
      }
    }
    return null
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
        return cb( erf('bad path or ' + type.substring(2) + ': ' + fname ))
      }
      if ( !stats[type]() ) {
        return cb ( erf( path.basename(fname) + ' not of type ' + type.substring(2)))
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
            cb(null, fname)
          })
        } catch (err) {
          return cb(err) // Could add more info
        }
      })
    })
  } // end copyFIle

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

  //
  // ###### PRINT #######
  // ya, prints.
  //
  function print (msgArray) {
    var i
    for (i = 0; i < msgArray.length; i += 1) {
      console.log(msgArray[i])
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
    state.activebin = null
    fs.readFile(that.fglobal, 'utf8', function (err, data) {
      if (err) {
        console.log ("Problem reading global state file. It might be missing or corrupt")
        var i = rl.createInterface(process.stdin, process.stdout, null);
        return i.question("Would you like to create a blank default global file? (y/n): ", function(answer) {
          i.close()
          if (answer === 'y' || answer === 'Y') {
            writeState(state, '', function (err) {
              if (err) throw err
              console.log('Wrote blank .gitbinGlobal file. Please reissue command')
              process.stdin.destroy()
            }) // end WRITESTATE
          }
          else {
            console.log('No action taken. Replace .gitbinGlobal with a backup or run gitbin again.')
            process.stdin.destroy()
          }
        }) // end Returned Question
      }
      try {
        var bins = JSON.parse(data)
      } catch (err) {
        return cb( erf('Problem parsing global state file: '+  that.fglobal) )
      }

      if (typeof(bins) !== 'object') {
        return cb( erf('Problem with main global state file: ' + that.fglobal) )
      }
      if (isEmpty( bins )) {
        return cb(null, state)
      }
      state.bins = bins
      ////////////////////////////////////////////////////////////
      state.activebin = getActiveBin( bins )
      if (!state.activebin) {
        return cb(null, state)
      }
      var localbinfile = path.join(state.activebin, that.flocal)
      fs.readFile(localbinfile, 'utf8', function (err, data) {
        if (err) {
          console.log ("Problem reading local tracked file list. It might be missing or corrupt.")
          var i = rl.createInterface(process.stdin, process.stdout, null)
          , question = "Would you like to create a blank default tracked file list? (y/n): "
          return i.question( question , function(answer) {
            i.close()
            if (answer === 'y' || answer === 'Y') {
              writeState(state, localbinfile, function (err) {
                if (err) throw err
                console.log('Wrote blank .gitbinLocal file to bin '
                            + path.basename(state.activebin)
                            + '. Please reissue command')
                process.stdin.destroy()
              }) // end WRITESTATE
            }
            else {
              console.log('No action taken. Replace .gitbinGlobal with a backup or run gitbin again.')
              process.stdin.destroy()
            }
          }) // end Returned Question
        }
        try {
          var tfiles = JSON.parse(data)
        } catch (err) {
          return cb( erf('Problem parsing local state file: '
                         + localbinfile) )
        }
        if (typeof(tfiles) !== 'object') {
          return cb( erf('Problem with local tracked file list: ' + localbinfile) )
        }
        state.trackedfiles = tfiles
        return cb(null, state)
      }) // end READFILE local
    }) // end READFILE global
  }  // end READSTATE

  //
  // ## WriteState ##
  //
  function writeState (state, localfile, cb) {
    // Write to global file
    try {
      var data = JSON.stringify( state.bins, null, 4 )
    } catch(e) {
      console.log('Problem parsing state into JSON for writing')
    }
    fs.writeFile( that.fglobal, data, 'utf8', function (err) {
      if (err) return cb(err)
      if (localfile) {
        // Write to local file
        try {
          var data = JSON.stringify( state.trackedfiles, null, 4 )
        } catch(e) {
          return cb( erf('Problem parsing tracked file state into JSON for writing') )
        }
        fs.writeFile( localfile, data, 'utf8', function (err) {
          if (err) return cb(err)
          return cb(null)
        }) // end WriteFile Local
      }
      else return cb(null) // no localfile
    }) // end WriteFile Global
  } // end WRITESTATE


//
// ## Allow external accesss ##
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
  , '      gitbin fetch <file1> <filen>  - Selectively copy files from bin to filesystem.'
  , '      gitbin status                 - Prints bin and file status.'
  , ''
  , 'Author: Ben Postlethwaite'
]


return that  // Returns Application Object


}  // end app


