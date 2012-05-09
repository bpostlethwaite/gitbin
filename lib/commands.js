/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */

"use strict";

/*
 * Module Dependencies
 */
var ncp = require('ncp').ncp;
var path = require('path');
var fs = require('fs');
var errf = require('./errf').errf;
/*
 * Command Namespace
 */

var commands = function (args,State) {
    var that = {},
    my = {},
    e = errf(); // instance of error to use colors.
    my.args = args;
    my.state = State;
    /* 
     * INIT COMMAND
     */
     that.init = function ( cb ) {
        console.log( 'Going to initialize: ', process.cwd() );
         cb(null, getState() )
    };

    /* 
     * ADD COMMAND
     */
    that.add = function (cb) {
        var files = args; 
        /*
         * Check for file arguements
         * and bin validity
         */
        if (files.length === 0) {
            console.log('List files to add');
            cb( errf('<Add> command requires file arguments', true) , getState());
        }
        else {
            var bin = getActiveBin( getState() );
            var cp = function (arg, cb_) {
                fs.realpath (arg, function (err, argpath) {
                    if (err) cb_(err);
                    else {
                        chain( [ checkState, argpath, false]  // checks if file in state (don't want it to be = false)
                               ,[ checkItem, argpath, 'f']    // checks arg is file and not already added
                               ,[ checkItem, bin, 'd']        // checks bin is healthy directory
                               ,[ copyItem, argpath, bin ]    // copies file -> bin
                               ,[ changeState, argpath, 'add']// changes state variable
                               ,  cb_ );      //if all success, this callback routes state variable to app.writer
                    }
                }); // end fs.realpath
            } // end define cp 
            asyncMap( files, cp , cb);            
        }
    }; // end commands add
   
    /* 
     * BIN COMMAND
     */
    that.bin = function (cb) {
        var i;
        if (args.length > 0) {
            console.log('Don\'t need args with bin command');
        }
        for (i in getState()) {
            console.log( getState()[i].binfiles );
        }
        cb(null, getState());
    }; // end commands bin


    /////////////////////////////////////////////////////////
    // FUNCS - Internal private functions
    /////////////////////////////////////////////////////////
    /*
     * getState simple function that returns state.
     */
    var getState = function () {
        return my.state;
    };
 
    /*
     * checkState queries current state
     * to ensure status is valid before processing
     */
    var checkState = function ( item, inState, cb) {
        var i, state = getState();
        for (i in state) {
            if (state[i].active) {
                if (item in state[i].binfiles) {
                    if (inState) cb(null); // Yes we found item and it's good
                    else { //we found item and it's bad
                        cb( errf('Item: ' + e.blue + item
                                 + e.reset + ' is already being tracked.') ); 
                    }
                }
                else {
                    if (inState) { // item not found and it is bad
                        cb( errf('Item: ' + e.blue + item 
                                 + e.reset + 'is not in the tracked list.') );
                    }
                    else cb(null) // item not found and it's good
                }
            }
        }
    } // end checkState
                    
 
    /*
     * changeState is the function allowed to modify
     * the private variable my.state.
     * Function allows for multiple state changes
     * using a simple API
     */
    var changeState = function ( item, type, cb) {
        var i, state = my.state;
        switch (type) {
        case 'add':
            for (i in state) {
                if (state[i].active) {
                    state[i].binfiles[item] = true;
                }
            }
            break;
        case 'rm':
            for (i in state) {
                if (state[i].active) {
                    console.log('functionality not available');
                }
            }
            break;
        default:
            cb(new Error('Wrong arguments for function changeState'));
        }
        my.state = state;
        cb(null);
    }; // end changeState
            

    /*
     * Gets active bin, also checks bin's path.
     */
    var getActiveBin = function(state) {
        var i, bin;
        for (i in state) {
            if (state[i].active) {
                bin = state[i].bin;                
            } 
        } 
        return bin;
    }; // end getActiveBin

    /*
     * checkItem checks that file is a file or a dir is a dir.
     * Excepts either a 'f' or 'd' to determine
     * whether to check for a file or directory
     */
    var checkItem = function (item, type, cb) {
        fs.stat(item, function (error, stats) {
            if (type !== 'f' && type !== 'd') {
                throw new Error('Use "d" or "f" flag with checkItem func');
            }
            else if ( (type === 'f') && (error || !(stats.isFile())) ) {
                cb( errf('checkItem error with file ' + item
                         + '. Check path and that ' + item 
                         + ' is not a directory', false) );
            } // Probably need to mention something about improper bin pointer
            else if ( (type === 'd') && (error || !( stats.isDirectory())) ) {
                cb( errf('checkItem error with directory ' + item
                         + '. Check path and that ' + item 
                         + ' is not a file', false) );
            }
            else cb( null );
        }); // end fs.stat
    }; // end checkFile

    /*
     * copyItem does some async path manipulation
     * then calls ncp in a callback to copy added file
     * into active bin.
     */
    var copyItem = function( item, bin, cb) {
        var binpath = path.join(bin, path.basename(item));
        ncp(item, binpath, function (err) {
            if (err) {
                console.error(err);
                cb( errf('Problem copying file ' + item
                         + ' to destination ' + bin
                         + '\n Check paths.', false) );
            }
            else {
                cb(null)
            }
        }); // end realpath
    }; // end copyItem

    /*
     * Async Funcs taken directly from
     * Isaac Z. Schlueter @
     * http://howtonode.org/flow-control-in-npm
     * Modified by Ben Postlethwaite May 2012
     */
    var asyncMap = function (list, fn, cb_) {
        if (typeof cb_ !== "function") throw new Error(
            "No callback provided to asyncMap")
        var data = []
        , errState = null
        , l = list.length
        if (!l) return cb_(null, [])
        function cb (er, d) {
            if (errState) return
            //if (arguments.length > 1) data = data.concat(d)
            if (er) return cb_(errState = er, null)
            else if (-- l === 0) cb_(errState, getState() ) //THIS IS THE MAIN CALL BACK
        }
        list.forEach(function (ar) { fn(ar, cb) })
    } // end my.asyncMap

    /*
     * Async Funcs taken directly from
     * Isaac Z. Schlueter @
     * http://howtonode.org/flow-control-in-npm
     * Modified by Ben Postlethwaite May 2012
     */
    var chain =function () {
        var steps = Array.prototype.slice.call(arguments)
        , cb_ = steps.pop()
        , n = 0
        , l = steps.length
        nextStep(cb)
        function cb (er) {
            if (er) return cb_(er)
            if (++ n === l) return cb_(null)
            nextStep(cb)
        }
        function nextStep (cb) {
            var s = steps[n]
            // skip over falsey members
            if (!s) return cb()
            // simple function
            if (typeof s === "function") return s(cb)
            if (!Array.isArray(s)) throw new Error(
                "Invalid thing in chain: "+s)
            var obj = null
            , fn = s.shift()
            if (typeof fn === "object") {
                // [obj, "method", some, args]
                obj = fn
                fn = obj[s.shift()]
            }
            if (typeof fn !== "function") throw new Error(
                "Invalid thing in chain: "+typeof(fn))
            fn.apply(obj, s.concat(cb))
        }
    } // end my.chain

    return that; // Commands returns object with functionality

}; // end commands()









/*
var validate = {};
var validate.bin = function ( bin ) {
    path.exists(bin, function (exist) {
        if (exist) {
            return bin;
                }
                else {
                    
                }
            }); //end path.exist 
state.err = true;
                    state.errmsg = 'Bin: ' + bin + 'path does not exist',
                    , 'Please remove this bin from dot.js with <bin -d "bin"> command',
                    , 'or correct path to this directory';

*/
//var validate = {};
//var validate.file = function (file) {





exports.commands = commands;