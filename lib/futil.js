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
        if (!type) throw new Error('Include type in stats function');
        file.name = fname;
        fs.stat(file.name, function (err, stats) {
            if (err || !( stats[type]() )) return cb( err );
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
                try {
                    var readStream = fs.createReadStream(file.name)
                    ,   writeStream = fs.createWriteStream(target, { mode: file.mode });
                    readStream.pipe(writeStream);
                    readStream.on('end', function () {
                        cb(null);
                    });
                } catch (err) {
                    return cb(err);
                }
            }
        });
    }; // end copyFIle
    
 
    function readJSON (fname, cb) {
        var json;
        path.exists(fname, function ( exists ) {
            if (exists) {
                fs.readFile(fname, 'utf8', function (err, data) {
                    if (err || !data) {
                        return cb( errf('Problem reading file ' 
                                        + e.blue + fname + e.reset, false ));
                    }
                    try {
                        json = JSON.parse(data);
                    } catch (err) {
                        return cb(err);
                    }
 
                    cb(null, json);  
                }); //end readFile
            }
            else return cb( errf('No path to ' + fname,false) );
        }); // end path.exists
    }; // end readJSON


    function writeJSON (fname, data, cb) {
        var data =  JSON.stringify( data, null, 4 );
        fs.writeFile(fname, data, 'utf8', function (err) {
            if (err) return cb(err);
            cb(null);
        });
    };// end writestate

    that.stats = stats;
    that.copyFile = copyFile;
    that.readJSON = readJSON;
    that.writeJSON = writeJSON;

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