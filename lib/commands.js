/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */

"use strict";

//
// ## Module Dependencies ##
//
var path = require('path')
,   async = require('./futil').makeasync()
,   futil = require('./futil').makeutil()
,   errf = require('./errf').errf;



//////////////////////////////////////
// ## Command Namespace ##
// note commands function creates
// a commands object using functional
// inheritance pattern.
//////////////////////////////////////

var commands = function () {
    var that = {}
    ,   my = {} // private object
    ,   e = errf() 
    ,   printusage = true;
 

//
// ## RUN ##
// Main command router
//
    that.run = function (command, args, globalfile, cb) {

        my.args = args;
        my.globalfile = globalfile;

        switch (command) {
        case 'init':
            init();
            break;
        case 'add':
            add(cb);
            break;
        case 'remove':
            remove();
            break;
        case 'bin':
            bin();
            break;
        default:
            cb(errf( ((command === undefined) ? '' : 'Unknown command: ' + command), printusage ));
        }
    };
    

//
// ## INIT COMMAND ##
//
    function init ( ) {
        console.log( 'Going to initialize: ', process.cwd() );
     };



//
// ## ADD COMMAND ##
//
    function add (cb) {
        var files = my.args; 
// Check for file arguements
        if (files.length === 0) {
            return;
        }
// Get bin and run chained processes
        getState( function (err, state) {
            if (err) return cb(err); //ERROR 
            async.asyncMap( files, processchain , function (err) {
                if (err) return cb(err); //ERROR
                writeJSON(state.activebin + '/.localbin.json',
                           state.trackedfiles, function (err) {
                               if (err) return cb(err);
                               cb(null,state)
                           });
            }); // end asyncMap
                      
            function processchain (file, cb_) {
                var source = path.join(process.cwd(),file)
                , target = state.activebin + '/' + path.basename(file);
                async.chain( [ checkState, source, false] 
                             ,[ futil.copyFile, source, target] 
                             ,[changeState, source, 'add'] 
                             ,  cb_ );      
            }; //end processchain
        }); // end getState
    }; // end ADD
                 
//
// ## BIN COMMAND ##
//
    function bin () {
        var i;
        if (my.args.length > 0) {
            console.log('Don\'t need args with bin command, ignoring.');
        }
        for (i in getState()) {
            console.log( getState()[i].bin );
        }
        cb(null, null);
    }; // end commands bin



// ## GETSTATE ## 
// simple function that returns state.
//
    function getState (cb) {
        var state = {};
        futil.readJSON( my.globalfile, function (err, bins) {
            if (err) return cb(err);
            state.bins = bins;
            state.activebin = getActiveBin(state.bins);
            if (state.activebin) {
                futil.readJSON( state.activebin, function (err, files) {
                    if (err) return cb(err);                        
                    state.trackedfiles = files;
                    cb(null, state);
                }); //end readJSON
            }
            else return cb( errf(' No active bin') );
        }); // end readJSON
    }; // end getState

//
// ## GETACTIVEBIN ##
//
    function getActiveBin (bins) {
        var i, bin = null;
        for (i in bins) {
            if (bins[i]) {
                return i;
            }
            else return null;
        }
    };  // end getActiveBin




//
// ## CHECKSTATE ## 
// queries current state
// to ensure status is valid before processing
    function checkState ( item, inState, cb) {
        var i;
        if (state.trackedfiles[item]) {
            if (inState) cb(null); // Yes we found item and it's good
            else { //we found item and it's bad
                cb( errf('Item: ' + e.blue + item
                         + e.reset + ' is already being tracked.'), null ); 
            }
        }
        else {
            if (inState) { // item not found and it is bad
                cb( errf('Item: ' + e.blue + item 
                         + e.reset + 'is not in the tracked list.'), null );
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
        var i;
        switch (type) {
        case 'add':
            state.trackedfiles[item] = true;
            break;
        case 'rm':
            console.log('functionality not available');
            break;
        default:
            throw new Error('Wrong arguments for function changeState');
        }
        cb(null);   
    }; // end changeState


    return that; // Commands returns object with functionality


}; // end commands()


exports.commands = commands;