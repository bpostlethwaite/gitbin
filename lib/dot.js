/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */

"use strict";
var path = require('path');
var fs = require('fs');
    
// 
// ## Main Application object ##
// Note: Using functional pattern
// for object creation. No usage of 'new'.
//
var app = function (statefile) {    
    var that = {};
    that.statefile = statefile;
//
// Attempt to read statefile upon init.
//

//
// ## Start application function
//
    that.start = function ( cb ) {
        that.readstate( cb );
    }; // end start


//
// ## Prints application usage info ##
//
    that.usage = function () {
        print( [
            '',
            'dotjs - Gather scattered files into directory for use with git',
            '',
            'Usage:',
            '',
            '      dotjs init                   - Initializes directory.',
            '      dotjs add <file1> <filen>    - Adds n file[s] to bin.',
            '      dotjs remove <file1> <filen> - Removes n file[s] from bin.',
            '      dotjs bin                    - Lists initialized bins. Bin in focus is starred.',
            '      dotjs checkout <bin>         - Switches to bin <bin>.',
            '      dotjs push                   - Copies scattered files into bin.',
            '      dotjs pull                   - Copies bin files into filesystem [has saftey].',
            '      dotjs status                 - Prints bin and file status.',    
            '',
            'Author: Ben Postlethwaite'
        ]);
    };

    
    var emptybins = [
        {
            "bin": "",
            "active": true,
            "binfiles": {}
        }
    ];

    that.readstate = function ( cb ) {
        path.exists(that.statefile, function ( exists ) {
            var state;    
            if (exists) {
                fs.readFile(that.statefile, 'utf8', function (err, data) {
                    if (err) {
                        console.log('Problem reading statefile ' + that.statefile);
                        console.log('Delete file or copy backup statefile from bin directory');
                        cb(err);
                    }
                    else {
                        state = JSON.parse(data);
                        cb(null, state);
                    }
                }); //end readFile
            } 
            else {
                console.log('Statefile none existent, creating');
                state = emptybins;
                that.writestate(state);
                cb(null, state);
            }
        }); // end path.exists
    }; // end readstate


    that.writestate = function (state, cb) {
        var State =  JSON.stringify( state, null, 4 );
        fs.writeFile(this.statefile, State, 'utf8',cb);
    };// end writestate

    var print = function ( strlist ) {
        var i;
        if ( strlist.length  > 0 ) {
            for (i = 0; i < strlist.length; i += 1) {
                console.log(strlist[i]);
            }
        }
    }; // end print

    return that;
    
};

exports.app = app;


