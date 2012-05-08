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

var commands = function (args,state) {
    var that = {},
    my = {};
    
    /* 
     * INIT COMMAND
     */
     that.init = function ( cb ) {
        console.log( 'Going to initialize: ', process.cwd() );
         cb(null, state)
    };

    /* 
     * ADD COMMAND
     */
    that.add = function (cb) {
        /*
         * Cut out command, leave args
         */
        function cp (arg, cb_) {
            my.chain( [ my.checkItem, arg, 'f']
                     ,[ my.copyItem, arg, bin ]
                     ,  cb_ );
        } // end define cp

        var files = args; 
        /*
         * Check for file arguements
         * and bin validity
         */
        if (files.length === 0) {
            console.log('List files to add');
            cb( errf('<Add> command requires file arguments', true) , state);
        }
        else {
            var bin = my.getActiveBin( state );
            console.log('Active bin is: ' + bin);
        /*
         * aysnc iter files, if file exists and is file
         * copy to activated bin, change state. Using
         * chain to ensure correct sequencing.
         */ 
            my.asyncMap( files, cp , cb);
            
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
        for (i in state) {
            console.log( state[i].binfiles );
        }
        cb(null,state);
    }; // end commands bin


    ////////////////////////////////////////////////////////////
    // MY.FUNCS (Internal private functions
    ////////////////////////////////////////////////////////////
    /*
     * Gets active bin, also checks bin's path.
     */
    my.getActiveBin = function(state) {
        var i, bin;
        for (i in state) {
            if (state[i].active) {
                bin = state[i].bin;                
            } 
        } 
        return bin;
    }; // end getActiveBin

    /*
     * Checks that file is a file or a dir is a dir.
     * Excepts either a 'f' or 'd' to determine
     * whether to check for a file or directory
     */
    my.checkItem = function (item, type, cb) {
        fs.stat(item, function (error, stats) {
            if (type !== 'f' && type !== 'd') {
                throw new Error('Use "d" or "f" flag with checkItem func');
            }
            if ( (type === 'f') && error || !( stats.isFile() ) ) {
                cb( errf('problem with file ' + item
                         + '. Check path and that ' + item 
                         + ' is not a directory', false) );
            }
            else if ( (type === 'd') && error || !(stats.isFile()) ) {
                cb( errf('problem with directory ' + item
                         + '. Check path and that ' + item 
                         + ' is not a file', false) );
            }
            else cb( null );
        }); // end fs.stat
    }; // end checkFile

    my.copyItem = function( item, bin, cb) {
        fs.realpath( item , function (err, itempath) {
            if (err) cb(err);
            else {
                ncp(itempath, bin, function (err) {
                    if (err) {
                        console.error(err);
                        cb( errf('Problem copying file ' + itempath
                                 + ' to destination ' + bin
                                 + '\n Check paths.' ) );
                    }
                    else {
                        console.log('Copied file: ' + item);
                        cb(null)
                    }
                }); // end ncp
            }
        }); // end realpath
    }; // end copyItem

    /*
     * Async Funcs taken directly from
     * Isaac Z. Schlueter @
     * http://howtonode.org/flow-control-in-npm
     */
    my.asyncMap = function (list, fn, cb_) {
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
            else if (-- l === 0) cb_(errState, state)
        }
        list.forEach(function (ar) { fn(ar, cb) })
    } // end my.asyncMap

    my.chain =function () {
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