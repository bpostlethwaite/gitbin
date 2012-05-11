/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */

var  fs   = require('fs')
, errf = require('./errf').errf
, path = require('path');



var makeutil = function () {
    that = {};
    e = errf(); // for color
//
// ## STATS ##   
// asyncronously checks that file is a file or a 
// dir is a dir.
// Adds a mode = stats.mode property to file.
//  
    function stats (fname, type, cb) {
        var file = {};
        file.name = fname;
        fs.stat(file.name, function (err, stats) {
            if (err || !( stats[type]() )) {            
                cb( errf('File error with ' + e.blue + file.name + e.reset), null )
            }
            else {
                file.mode = stats.mode;
                cb(null, file);
            }
        }); // end fs.stat
    }; // end stats
    

//
// ## COPYFile ## 
// adds filename to bin path
// then creates stream objects and calls
// pump to pump the bits over.
//

    function copyFile (fname, target, cb) { 
        stats(fname, 'isFile', function (err, file) {
            if (err) cb(err, null)
            else {
                var readStream = fs.createReadStream(file.name)
                ,   writeStream = fs.createWriteStream(target, { mode: file.mode });
                readStream.pipe(writeStream);
                writeStream.on('error', function(err) {
                    cb( errf('Error copying ' + e.blue 
                             + file.name + e.red
                             + ' to target ' + e.blue 
                             + target + e.reset), null );
                });
                readStream.on('error', function(err) {
                    cb( errf('Error copying ' + e.blue 
                             + file.name + e.red
                             + ' to target ' + e.blue 
                             + target + e.reset), null );
                });
                readStream.on('end', function () {
                    cb(null);
                });
            }
        });
    }; // end copyFIle
    
 
    function readJSON (fname, cb) {
        path.exists(fname, function ( exists ) {
            var Data;
            if (exists) {
                fs.readFile(fname, 'utf8', function (err, data) {
                    if (err || !data) cb(err);
                    else {
                        Data = JSON.parse(data);
                        if (typeof(Data) !== 'object') { 
                            cb(err)
                        }
                        else cb(null, Data);
                    }
                }); //end readFile
            }
            else cb(null,null);
        }); // end path.exists
    }; // end readJSON

    that.readJSON = readJSON;
    that.stats = stats;
    that.copyFile = copyFile;

    return that;

}; //end futil




var makeasync = function () { 

    var that = {};


//
// Async Funcs taken directly from
// Isaac Z. Schlueter @
// http://howtonode.org/flow-control-in-npm
// Modified by Ben Postlethwaite May 2012
//
    that.asyncMap = function (list, fn, cb_) {
        if (typeof cb_ !== "function") throw new Error(
            "No callback provided to asyncMap")
        var data = []
        ,   errState = null
        , l = list.length
        if (!l) return cb_(null, [])
        function cb (er, d) {
            if (errState) return
            if (arguments.length > 1) data = data.concat(d)
            if (er) return cb_(errState = er, data)
            else if (-- l === 0) cb_(errState, data ) //THIS IS THE MAIN CALL BACK
        }
        list.forEach(function (ar) { fn(ar, cb) })
    }; // end my.asyncMap
//
// Async Funcs taken directly from
// Isaac Z. Schlueter @
// http://howtonode.org/flow-control-in-npm
// Modified by Ben Postlethwaite May 2012
// Perhaps modify further to allow data concat in callbacks
//
    that.chain =function () {
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
    }; // end my.chain
    
    return that;
    
}; // end makeasync
    

exports.makeutil = makeutil;
    exports.makeasync = makeasync;